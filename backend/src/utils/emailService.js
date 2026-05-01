const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

// We will cache the transporter to reuse it.
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // Use real SMTP if provided in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Generate Ethereal Email account for local testing
    console.log("[Email Service] Creating Ethereal Test Account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("[Email Service] Ethereal Test Account created:", testAccount.user);
  }

  return transporter;
}

const sendEmail = async (mailOptions) => {
  try {
    const mailTransporter = await getTransporter();
    // Default from email
    const fromEmail = process.env.FROM_EMAIL || '"MOVEIT Notifications" <noreply@moveit.com>';
    
    const info = await mailTransporter.sendMail({
      from: fromEmail,
      ...mailOptions,
    });
    
    console.log("[Email Service] Message sent: %s", info.messageId);
    if (!process.env.SMTP_HOST) {
      // Preview only available when sending through an Ethereal account
      console.log("[Email Service] Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("[Email Service] Error sending email:", error);
  }
};

/**
 * Send an email when a user posts a parcel
 */
const sendJobPostedEmail = async (user, job) => {
  const mailOptions = {
    to: user.email,
    subject: "Your Parcel has been posted on MOVEIT!",
    text: `Hello,\n\nYour parcel (Job ID: ${job._id}) has been successfully posted on MOVEIT.\n\nDescription: ${job.description}\nFrom: ${job.fromAddress}\nTo: ${job.toAddress}\n\nTransporters can now bid on your parcel. You can log in to your dashboard to view the bids.\n\nThank you for using MOVEIT!`,
    html: `
      <h2>Parcel Posted Successfully</h2>
      <p>Hello,</p>
      <p>Your parcel (<strong>Job ID: ${job._id}</strong>) has been successfully posted on MOVEIT.</p>
      <ul>
        <li><strong>Description:</strong> ${job.description}</li>
        <li><strong>From:</strong> ${job.fromAddress}</li>
        <li><strong>To:</strong> ${job.toAddress}</li>
      </ul>
      <p>Transporters can now bid on your parcel. You can log in to your dashboard to view the bids.</p>
      <p>Thank you for using MOVEIT!</p>
    `,
  };

  await sendEmail(mailOptions);
};

/**
 * Send an email when a transporter applies a bid to a job
 */
const sendBidAppliedEmail = async (user, job, transporterObj, bid) => {
  // Transporter might be passed as an object or we might need to rely on populated fields. 
  // Assuming transporterObj has email/name. If profile is missing, fallback to email.
  const transporterName = transporterObj.email || "A transporter";

  const mailOptions = {
    to: user.email,
    subject: "New Bid on your Parcel!",
    text: `Hello,\n\nYou have received a new bid on your parcel (Job ID: ${job._id}).\n\nTransporter: ${transporterName}\nBid Amount: ₹${bid.amount}\nMessage: ${bid.description || "N/A"}\n\nLog in to your dashboard to accept or reject this bid.\n\nThank you,\nMOVEIT`,
    html: `
      <h2>New Bid Received</h2>
      <p>Hello,</p>
      <p>You have received a new bid on your parcel (<strong>Job ID: ${job._id}</strong>).</p>
      <ul>
        <li><strong>Transporter:</strong> ${transporterName}</li>
        <li><strong>Bid Amount:</strong> ₹${bid.amount}</li>
        <li><strong>Message:</strong> ${bid.description || "N/A"}</li>
      </ul>
      <p>Log in to your dashboard to accept or reject this bid.</p>
      <p>Thank you,<br/>MOVEIT</p>
    `,
  };

  await sendEmail(mailOptions);
};

/**
 * Generates a PDF receipt buffer
 */
const generateReceiptPDF = (user, job, transporterName, bid) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // PDF Content
      doc.fontSize(20).text('MOVEIT - Payment Receipt', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12)
         .text(`Date: ${new Date().toLocaleDateString()}`)
         .text(`Receipt ID: REC-${bid._id.toString().substring(0, 8).toUpperCase()}`);
      
      doc.moveDown();
      doc.fontSize(16).text('Customer Details');
      doc.fontSize(12).text(`Email: ${user.email}`);
      
      doc.moveDown();
      doc.fontSize(16).text('Parcel Details');
      doc.fontSize(12)
         .text(`Job ID: ${job._id}`)
         .text(`Description: ${job.description}`)
         .text(`From: ${job.fromAddress}`)
         .text(`To: ${job.toAddress}`)
         .text(`Transport Date: ${new Date(job.transportDate).toLocaleDateString()}`);

      doc.moveDown();
      doc.fontSize(16).text('Transporter Details');
      doc.fontSize(12)
         .text(`Transporter: ${transporterName}`);

      doc.moveDown(2);
      
      // Box for the fee
      doc.rect(50, doc.y, 500, 40).stroke();
      doc.fontSize(14).text(`Total Agrees Fee: Rs. ${bid.amount}`, 60, doc.y + 12);
      
      doc.moveDown(4);
      doc.fontSize(10).text('Thank you for using MOVEIT for your logistics needs.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Send an email with a PDF receipt when a bid is accepted
 */
const sendReceiptEmail = async (user, job, transporterObj, bid) => {
  const transporterName = transporterObj.email || "Your Transporter";

  try {
    const pdfBuffer = await generateReceiptPDF(user, job, transporterName, bid);

    const mailOptions = {
      to: user.email,
      subject: "MOVEIT - Your Parcel Receipt",
      text: `Hello,\n\nYou have accepted a bid for your parcel (Job ID: ${job._id}).\n\nTransporter: ${transporterName}\nAgreed Fee: ₹${bid.amount}\n\nPlease find your receipt attached as a PDF.\n\nThank you,\nMOVEIT`,
      html: `
        <h2>Bid Accepted - Receipt Enclosed</h2>
        <p>Hello,</p>
        <p>You have successfully accepted a bid for your parcel (<strong>Job ID: ${job._id}</strong>).</p>
        <ul>
          <li><strong>Transporter:</strong> ${transporterName}</li>
          <li><strong>Agreed Fee:</strong> ₹${bid.amount}</li>
        </ul>
        <p>Please find your official receipt attached to this email as a PDF.</p>
        <p>Thank you,<br/>MOVEIT</p>
      `,
      attachments: [
        {
          filename: `MOVEIT_Receipt_${bid._id.toString().substring(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await sendEmail(mailOptions);
  } catch (err) {
    console.error("[Email Service] Failed to generate/send receipt:", err);
  }
};

/**
 * Send an email to the transporter when their bid is accepted
 */
const sendBidAcceptedToTransporterEmail = async (transporterObj, job, user, bid) => {
  const transporterEmail = transporterObj.email;
  const userName = user.email || "A User";

  const mailOptions = {
    to: transporterEmail,
    subject: "Congratulations! Your Bid was Accepted on MOVEIT",
    text: `Hello,\n\nGreat news! Your bid for Job ID: ${job._id} has been accepted by ${userName}.\n\nAgreed Fee: ₹${bid.amount}\nFrom: ${job.fromAddress}\nTo: ${job.toAddress}\n\nPlease prepare for transportation. Log in to your dashboard for more details.\n\nThank you,\nMOVEIT`,
    html: `
      <h2>Bid Accepted!</h2>
      <p>Hello,</p>
      <p>Great news! Your bid for <strong>Job ID: ${job._id}</strong> has been accepted by ${userName}.</p>
      <ul>
        <li><strong>Agreed Fee:</strong> ₹${bid.amount}</li>
        <li><strong>From:</strong> ${job.fromAddress}</li>
        <li><strong>To:</strong> ${job.toAddress}</li>
      </ul>
      <p>Please prepare for transportation. Log in to your dashboard for more details.</p>
      <p>Thank you,<br/>MOVEIT</p>
    `,
  };

  await sendEmail(mailOptions);
};

module.exports = {
  sendJobPostedEmail,
  sendBidAppliedEmail,
  sendReceiptEmail,
  sendBidAcceptedToTransporterEmail
};
