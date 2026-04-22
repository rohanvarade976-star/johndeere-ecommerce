
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
const jdHeader = `<div style="background:#1a5c1a;padding:20px 32px;border-radius:10px 10px 0 0;display:flex;align-items:center;gap:12px">
  <div style="width:44px;height:44px;background:#ffde00;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#1a5c1a">JD</div>
  <div><div style="color:white;font-weight:800;font-size:17px;font-family:Arial">John Deere Parts System</div>
  <div style="color:rgba(255,255,255,0.6);font-size:12px;font-family:Arial">E-Commerce Parts Diagram System</div></div></div>`;
const jdFooter = `<div style="background:#f5f5f5;padding:14px 32px;border-radius:0 0 10px 10px;text-align:center;font-family:Arial;font-size:12px;color:#9e9e9e">
  © 2024 John Deere E-Commerce Parts Diagram System | MITAOE Software Engineering Project | ThoughtWorks Technologies India</div>`;

const sendOTP = async (email, name, otp) => {
  if (!process.env.EMAIL_USER) return;
  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM, to: email,
      subject: `${otp} — Verify Your Email | John Deere Parts`,
      html: `<div style="font-family:Arial;max-width:520px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
        ${jdHeader}
        <div style="padding:28px 32px">
          <h2 style="color:#1a5c1a;margin:0 0 8px">Hello, ${name}!</h2>
          <p style="color:#616161;line-height:1.6">Please verify your email address to access the John Deere Parts System.</p>
          <div style="background:#1a5c1a;color:#ffde00;font-size:38px;font-weight:900;text-align:center;padding:22px;border-radius:10px;letter-spacing:12px;margin:22px 0">${otp}</div>
          <p style="color:#9e9e9e;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>${jdFooter}</div>`
    });
  } catch(e) { console.log('Email skipped:', e.message); }
};

const sendOrderConfirmation = async (email, name, order, items) => {
  if (!process.env.EMAIL_USER) return;
  try {
    const rows = items.map(i => `<tr><td style="padding:10px;border-bottom:1px solid #eee">${i.part_name}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#1a5c1a">₹${parseFloat(i.sub_total).toLocaleString()}</td></tr>`).join('');
    await transport.sendMail({
      from: process.env.EMAIL_FROM, to: email,
      subject: `Order Confirmed #${order.order_number} | John Deere Parts System`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
        ${jdHeader}
        <div style="padding:28px 32px">
          <h2 style="color:#1a5c1a">Order Confirmed! 🎉</h2>
          <p>Hi ${name}, your order <strong>#${order.order_number}</strong> has been placed successfully.</p>
          <table style="width:100%;border-collapse:collapse;margin:18px 0"><thead><tr style="background:#f5f5f5"><th style="padding:10px;text-align:left">Part</th><th style="padding:10px;text-align:center">Qty</th><th style="padding:10px;text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
          <div style="background:#e8f5e9;padding:16px;border-radius:8px"><div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:#1a5c1a"><span>Grand Total</span><span>₹${parseFloat(order.total_amount).toLocaleString()}</span></div></div>
          <p style="color:#9e9e9e;font-size:13px;margin-top:16px">Estimated delivery: 3–5 business days. We'll send tracking details once shipped.</p>
        </div>${jdFooter}</div>`
    });
  } catch(e) { console.log('Email skipped:', e.message); }
};

module.exports = { sendOTP, sendOrderConfirmation };
