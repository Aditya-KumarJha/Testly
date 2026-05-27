import { getResendClient } from "./resend";
import { getRequiredEnv } from "./env";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Main dispatcher called by the RabbitMQ consumer when an event is received.
 */
export async function processEmailQueueMessage(event: string, data: any): Promise<boolean> {
  console.log(`[EmailService] Processing event "${event}" with data size:`, Array.isArray(data) ? `${data.length} runs` : "single");
  
  try {
    switch (event) {
      case "USER_LOGIN":
        await sendWelcomeEmail(data.email, data.name);
        return true;
      case "PAYMENT_CONFIRMED":
        await sendPaymentEmail(data.email, data.name, data.planId, data.creditsAdded, data.totalCredits);
        return true;
      case "TEST_RUN_COMPLETED":
        await sendTestRunEmail(data);
        return true;
      default:
        console.warn(`[EmailService] Unknown event type: ${event}`);
        return false;
    }
  } catch (error) {
    console.error(`[EmailService] Failed to process event "${event}":`, error);
    return false;
  }
}

/**
 * Sends a welcome email after a successful login or signup.
 */
async function sendWelcomeEmail(email: string, name: string) {
  const resend = getResendClient();
  const fromEmail = getRequiredEnv("RESEND_FROM");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Testly</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 48px 32px; text-align: center; color: #ffffff; }
          .logo { font-size: 32px; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 8px; }
          .logo span { color: #818cf8; }
          .header h1 { font-size: 24px; font-weight: 700; margin: 0; margin-top: 16px; letter-spacing: -0.02em; }
          .content { padding: 40px 32px; line-height: 1.6; }
          .content h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
          .content p { font-size: 16px; color: #475569; margin-bottom: 24px; }
          .steps-container { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
          .step { display: flex; margin-bottom: 16px; }
          .step:last-child { margin-bottom: 0; }
          .step-num { width: 28px; height: 28px; background-color: #4f46e5; color: #ffffff; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; font-size: 14px; }
          .step-text { font-size: 15px; color: #334155; padding-top: 2px; }
          .step-title { font-weight: 700; color: #0f172a; display: block; margin-bottom: 2px; }
          .cta-btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: background-color 0.2s; }
          .footer { background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #94a3b8; }
          .footer a { color: #64748b; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Test<span>ly</span></div>
            <h1>Your QA Automation Journey Starts Here</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Welcome to Testly! We are thrilled to have you onboard. Testly is your agentic AI-powered companion designed to automate writing and executing robust browser test cases using Playwright and Browserbase.</p>
            
            <p>To help you hit the ground running, here are the first steps to automate your testing pipeline:</p>
            
            <div class="steps-container">
              <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">
                  <span class="step-title">Connect your GitHub Repository</span>
                  Link your active codebases to let Testly read component selectors, forms, and pages.
                </div>
              </div>
              <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">
                  <span class="step-title">Generate AI Test Cases</span>
                  Describe what needs testing, and let Gemini generate robust scripts custom-tailored to your UI layout.
                </div>
              </div>
              <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">
                  <span class="step-title">Execute Cloud Browser Sessions</span>
                  Run tests on our Browserbase cloud browsers, and watch real-time sessions complete in seconds.
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 32px; margin-bottom: 8px;">
              <a href="http://localhost:3000/workspace" class="cta-btn">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent to ${email} because you created a Testly account.</p>
            <p>&copy; ${new Date().getFullYear()} Testly. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: `Testly <${fromEmail}>`,
    to: email,
    subject: "Welcome to Testly – The Intelligent Test Automation Agent 🚀",
    html,
  });

  console.log(`[EmailService] Welcome email sent successfully to ${email}`);
}

/**
 * Sends a payment confirmation email.
 */
async function sendPaymentEmail(email: string, name: string, planId: string, creditsAdded: number, totalCredits: number) {
  const resend = getResendClient();
  const fromEmail = getRequiredEnv("RESEND_FROM");

  const plansNames: Record<string, string> = {
    basic: "Starter Credit Package",
    intermediate: "Developer Credit Package",
    pro: "Enterprise Credit Package",
  };

  const planPrices: Record<string, string> = {
    basic: "INR 199",
    intermediate: "INR 499",
    pro: "INR 999",
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmed</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #059669 0%, #065f46 100%); padding: 48px 32px; text-align: center; color: #ffffff; }
          .logo { font-size: 32px; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 8px; }
          .logo span { color: #a7f3d0; }
          .header h1 { font-size: 24px; font-weight: 700; margin: 0; margin-top: 16px; letter-spacing: -0.02em; }
          .content { padding: 40px 32px; line-height: 1.6; }
          .content h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
          .content p { font-size: 16px; color: #475569; margin-bottom: 24px; }
          
          .metrics-grid { display: flex; gap: 16px; margin-bottom: 32px; }
          .metric-card { flex: 1; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; }
          .metric-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em; }
          .metric-val { font-size: 28px; font-weight: 800; color: #059669; }
          .metric-val.total { color: #1e293b; }
          .metric-val.price { color: #0284c7; }

          .invoice-box { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0; }
          .invoice-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; letter-spacing: 0.05em; }
          .invoice-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #475569; }
          .invoice-row.bold { font-weight: 700; color: #0f172a; margin-top: 16px; border-top: 1px solid #cbd5e1; padding-top: 12px; }
          
          .cta-btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2); }
          .footer { background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Test<span>ly</span></div>
            <h1>Credits Added Successfully!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for your purchase! We have successfully processed your payment and credited your account. Your new balance is ready to use for running automated AI test cases.</p>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Paid</div>
                <div class="metric-val price">${planPrices[planId] || "INR 199"}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Credits Added</div>
                <div class="metric-val">+${creditsAdded}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">New Balance</div>
                <div class="metric-val total">${totalCredits}</div>
              </div>
            </div>
            
            <div class="invoice-box">
              <div class="invoice-title">Transaction Receipt</div>
              <div class="invoice-row">
                <span>Account Name</span>
                <strong>${name}</strong>
              </div>
              <div class="invoice-row">
                <span>Account Email</span>
                <strong>${email}</strong>
              </div>
              <div class="invoice-row">
                <span>Product Description</span>
                <strong>${plansNames[planId] || "Credits Package"}</strong>
              </div>
              <div class="invoice-row">
                <span>Transaction Date</span>
                <strong>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>
              </div>
              <div class="invoice-row">
                <span>Invoice ID</span>
                <strong>INV-${Math.floor(100000 + Math.random() * 900000)}</strong>
              </div>
              <div class="invoice-row bold">
                <span>Amount Charged</span>
                <span>${planPrices[planId] || "INR 199"}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 32px; margin-bottom: 8px;">
              <a href="http://localhost:3000/workspace" class="cta-btn">Run Automated Tests Now</a>
            </div>
          </div>
          <div class="footer">
            <p>This email serves as an official receipt for your purchase from Testly. If you have any questions, please contact billing@testly.ai</p>
            <p>&copy; ${new Date().getFullYear()} Testly. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: `Testly Billing <${fromEmail}>`,
    to: email,
    subject: "Credits Added Successfully! – Testly Invoice & Receipt 💳",
    html,
  });

  console.log(`[EmailService] Payment email sent successfully to ${email}`);
}

/**
 * Helper to strip ANSI escape codes and characters incompatible with WinAnsi encoding.
 */
function stripAnsiAndInvalidChars(str: string): string {
  if (!str) return "";
  
  // 1. Remove ANSI escape codes (colors, text formatting)
  // eslint-disable-next-line no-control-regex
  let cleaned = str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
  
  // 2. Remove non-printable control characters that WinAnsi cannot encode
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

  // 3. Replace any other non-WinAnsi printable characters with '?' to avoid pdf-lib crashes
  const winAnsiRegex = /[^\x20-\x7E\xA0-\xFF\r\n\t]/g;
  cleaned = cleaned.replace(winAnsiRegex, "?");

  return cleaned;
}

/**
 * Generates a beautiful, professional PDF execution report.
 * Supports both single runs and combined batch runs.
 */
async function generateTestReportPdf(runs: any[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const hasMultiple = runs.length > 1;
  let page = pdfDoc.addPage([595, 842]); // A4 Standard
  let y = 780;

  if (hasMultiple) {
    // ----------------------------------------------------
    // COVER / SUMMARY PAGE (For Batched Runs)
    // ----------------------------------------------------
    page.drawRectangle({
      x: 0,
      y: 720,
      width: 595,
      height: 122,
      color: rgb(0.09, 0.14, 0.23), // Dark Navy
    });

    page.drawText("TESTLY BATCH RUN REPORT", {
      x: 40,
      y: 785,
      size: 20,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    const passedCount = runs.filter((r) => (r.status || "passed") === "passed").length;
    const failedCount = runs.filter((r) => (r.status || "failed") === "failed").length;

    page.drawText(`Executed: ${runs.length} test cases  |  Passed: ${passedCount}  |  Failed: ${failedCount}`, {
      x: 40,
      y: 760,
      size: 11,
      font: helvetica,
      color: rgb(0.9, 0.9, 0.9),
    });

    y = 670;
    page.drawText("Summary Dashboard", { x: 40, y, size: 14, font: helveticaBold, color: rgb(0.09, 0.14, 0.23) });
    page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: 555, y: y - 5 }, thickness: 1, color: rgb(0.88, 0.9, 0.94) });
    y -= 30;

    // Draw Dashboard Table Header
    page.drawText("Test Case Title", { x: 40, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.45, 0.55) });
    page.drawText("Priority", { x: 300, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.45, 0.55) });
    page.drawText("Target Route", { x: 385, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.45, 0.55) });
    page.drawText("Status", { x: 490, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.45, 0.55) });
    y -= 15;

    // Draw row for each test run
    runs.forEach((r, idx) => {
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      page.drawLine({ start: { x: 40, y: y + 8 }, end: { x: 555, y: y + 8 }, thickness: 0.5, color: rgb(0.92, 0.93, 0.95) });

      let titleStr = `${idx + 1}. ${(r.testCase?.title || "Untitled Test Case")}`;
      if (titleStr.length > 36) titleStr = titleStr.slice(0, 34) + "...";
      page.drawText(titleStr, { x: 40, y, size: 9, font: helvetica, color: rgb(0.12, 0.16, 0.23) });
      
      page.drawText((r.testCase?.priority || "medium").toUpperCase(), { x: 300, y, size: 9, font: helvetica, color: rgb(0.12, 0.16, 0.23) });
      
      let routeStr = r.targetRoute || "/";
      if (routeStr.length > 18) routeStr = routeStr.slice(0, 16) + "...";
      page.drawText(routeStr, { x: 385, y, size: 9, font: courier, color: rgb(0.12, 0.16, 0.23) });
      
      const isPass = (r.status || "passed") === "passed";
      page.drawText((r.status || "passed").toUpperCase(), { 
        x: 490, 
        y, 
        size: 9, 
        font: helveticaBold, 
        color: isPass ? rgb(0.02, 0.58, 0.41) : rgb(0.95, 0.24, 0.36) 
      });

      y -= 20;
    });

    // Advance to a fresh page to begin detailed case logs
    page = pdfDoc.addPage([595, 842]);
    y = 780;
  }

  // ----------------------------------------------------
  // DETAILED PAGES FOR EACH TEST CASE
  // ----------------------------------------------------
  runs.forEach((run, index) => {
    const { testCase, logs, status, repoName, repoOwner, branch, targetRoute, creditsUsed, user } = run;

    // Start each subsequent test case on a fresh new page
    if (index > 0 || hasMultiple) {
      page = pdfDoc.addPage([595, 842]);
      y = 780;
    }

    const safeStatus = status || "passed";
    const safeTestCase = testCase || {};
    const safeUser = user || { email: "user@testly.ai", name: "Testly User" };

    // Header band for this test case
    const headerColor = safeStatus === "passed" ? rgb(0.02, 0.58, 0.41) : rgb(0.95, 0.24, 0.36); // emerald or rose
    page.drawRectangle({
      x: 0,
      y: 720,
      width: 595,
      height: 122,
      color: headerColor,
    });

    // Header Text
    page.drawText(hasMultiple ? `TEST CASE #${index + 1} REPORT` : "TESTLY AUTOMATION REPORT", {
      x: 40,
      y: 785,
      size: 20,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    let headerSubtitle = `Status: ${safeStatus.toUpperCase()}  |  Title: ${safeTestCase.title || "Untitled"}`;
    if (headerSubtitle.length > 75) headerSubtitle = headerSubtitle.slice(0, 72) + "...";
    page.drawText(headerSubtitle, {
      x: 40,
      y: 760,
      size: 10,
      font: helvetica,
      color: rgb(0.9, 0.9, 0.9),
    });

    y = 690;

    // Section: Metadata
    page.drawText("Test Execution Metadata", { x: 40, y, size: 14, font: helveticaBold, color: rgb(0.09, 0.14, 0.23) });
    page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: 555, y: y - 5 }, thickness: 1, color: rgb(0.88, 0.9, 0.94) });
    y -= 25;

    const metadata = [
      { label: "Test Case Title", val: safeTestCase.title || "Untitled" },
      { label: "Repository", val: `${repoOwner || "unknown"}/${repoName || "unknown"}` },
      { label: "Target Route", val: targetRoute || "/" },
      { label: "Priority", val: (safeTestCase.priority || "medium").toUpperCase() },
      { label: "Branch", val: branch || "main" },
      { label: "Credits Consumed", val: `${creditsUsed || 10} credits` },
      { label: "User Email", val: safeUser.email },
      { label: "Session ID", val: safeTestCase.sessionId || "N/A" },
    ];

    for (const item of metadata) {
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      page.drawText(item.label, { x: 40, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.45, 0.55) });
      
      // Auto wrap long metadata values and clean WinAnsi incompatible characters
      const valueText = stripAnsiAndInvalidChars(String(item.val));
      if (valueText.length > 65) {
        page.drawText(valueText.slice(0, 65) + "...", { x: 180, y, size: 10, font: courier, color: rgb(0.12, 0.16, 0.23) });
      } else {
        page.drawText(valueText, { x: 180, y, size: 10, font: courier, color: rgb(0.12, 0.16, 0.23) });
      }
      y -= 18;
    }

    y -= 15;

    // Section: Automation Script
    if (y < 120) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    page.drawText("Playwright Execution Script", { x: 40, y, size: 14, font: helveticaBold, color: rgb(0.09, 0.14, 0.23) });
    page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: 555, y: y - 5 }, thickness: 1, color: rgb(0.88, 0.9, 0.94) });
    y -= 20;

    const scriptCleaned = stripAnsiAndInvalidChars(safeTestCase.browserbaseScript || "");
    const scriptLines = scriptCleaned.split("\n").filter((line: string) => line.trim().length > 0);
    
    // Grey background for script block
    const scriptBlockHeight = Math.min(scriptLines.length * 12 + 15, 200);
    page.drawRectangle({
      x: 40,
      y: y - scriptBlockHeight + 10,
      width: 515,
      height: scriptBlockHeight,
      color: rgb(0.97, 0.97, 0.98),
    });

    let scriptY = y - 5;
    for (let i = 0; i < scriptLines.length; i++) {
      if (scriptY - 12 < y - scriptBlockHeight + 15) {
        page.drawText("... [script truncated in PDF preview]", { x: 50, y: scriptY, size: 8, font: courier, color: rgb(0.5, 0.5, 0.5) });
        break;
      }
      const safeLine = scriptLines[i].replace(/\t/g, "  ").slice(0, 80);
      page.drawText(safeLine, { x: 50, y: scriptY, size: 8, font: courier, color: rgb(0.2, 0.2, 0.3) });
      scriptY -= 12;
    }

    y -= (scriptBlockHeight + 20);

    // Section: Full Execution Logs
    if (y < 100) {
      page = pdfDoc.addPage([595, 842]);
      y = 800;
    }

    page.drawText("Live Execution Logs", { x: 40, y, size: 14, font: helveticaBold, color: rgb(0.09, 0.14, 0.23) });
    page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: 555, y: y - 5 }, thickness: 1, color: rgb(0.88, 0.9, 0.94) });
    y -= 25;

    const logLines = Array.isArray(logs) ? logs : [];
    if (logLines.length === 0) {
      page.drawText("No execution logs captured.", { x: 40, y, size: 10, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    } else {
      for (const log of logLines) {
        if (y < 50) {
          page = pdfDoc.addPage([595, 842]);
          y = 800;
        }

        const logText = stripAnsiAndInvalidChars(String(log));
        const isSystemError = logText.includes("[SYSTEM ERROR]") || logText.includes("[ERROR]");
        const isBrowser = logText.includes("[BROWSER]");
        const color = isSystemError ? rgb(0.85, 0.15, 0.25) : isBrowser ? rgb(0.3, 0.3, 0.5) : rgb(0.15, 0.2, 0.25);
        const fontToUse = isSystemError ? helveticaBold : courier;

        const chunks = [];
        for (let i = 0; i < logText.length; i += 85) {
          chunks.push(logText.slice(i, i + 85));
        }

        for (const chunk of chunks) {
          if (y < 50) {
            page = pdfDoc.addPage([595, 842]);
            y = 800;
          }
          page.drawText(chunk, { x: 40, y, size: 8, font: fontToUse, color });
          y -= 12;
        }
      }
    }
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Sends a detailed test run confirmation email with HTML and PDF report.
 * Supports both single runs and combined batch runs.
 */
async function sendTestRunEmail(data: any) {
  const runs = Array.isArray(data) ? data : [data];
  const totalRuns = runs.length;
  const passedRuns = runs.filter((r: any) => (r.status || "passed") === "passed").length;
  const failedRuns = runs.filter((r: any) => (r.status || "failed") === "failed").length;
  const totalCredits = runs.reduce((acc: number, r: any) => acc + (r.creditsUsed || 0), 0);
  const firstRun = runs[0];
  const { repoName, repoOwner, user } = firstRun;

  const resend = getResendClient();
  const fromEmail = getRequiredEnv("RESEND_FROM");

  // Compile PDF Report (Combined Multi-page or Single)
  console.log(`[EmailService] Compiling detailed PDF execution report for ${totalRuns} run(s)...`);
  const pdfBuffer = await generateTestReportPdf(runs);
  console.log("[EmailService] PDF generated successfully, size:", pdfBuffer.length, "bytes");

  const overallStatus = failedRuns > 0 ? "failed" : "passed";
  const overallStatusColor = overallStatus === "passed" ? "#10b981" : "#ef4444";
  const overallStatusLabel = overallStatus.toUpperCase();

  let subject = `[${overallStatusLabel}] Test Case Automation Report: ${firstRun.testCase?.title || "Untitled"} 📊`;
  if (totalRuns > 1) {
    subject = `[${overallStatusLabel}] Combined Test Execution Report: ${totalRuns} Cases Executed (${passedRuns} Passed, ${failedRuns} Failed) 📊`;
  }

  // Build HTML Details Content
  let testDetailsHtml = "";
  if (totalRuns === 1) {
    // Single Test Details Layout
    testDetailsHtml = `
      <div class="test-details">
        <div class="detail-row">
          <div class="detail-label">Test Case</div>
          <div class="detail-val" style="font-family: inherit; font-weight: 600;">${firstRun.testCase?.title || "Untitled"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Repository</div>
          <div class="detail-val">${repoOwner || "unknown"}/${repoName || "unknown"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Branch</div>
          <div class="detail-val">${firstRun.branch || "main"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Target Route</div>
          <div class="detail-val">${firstRun.targetRoute || "/"}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Session ID</div>
          <div class="detail-val">${firstRun.testCase?.sessionId || "N/A"}</div>
        </div>
      </div>
      
      ${firstRun.testCase?.sessionUrl ? `
      <div style="text-align: center; margin-top: 32px; margin-bottom: 8px;">
        <a href="${firstRun.testCase.sessionUrl}" class="cta-btn">View Browserbase Recording</a>
      </div>
      ` : ""}
    `;
  } else {
    // Combined Multi-Test Table and Accordion Layout!
    testDetailsHtml = `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Executed Test Cases Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px 8px; color: #64748b; font-weight: 600; width: 45%;">Test Case</th>
              <th style="padding: 10px 8px; color: #64748b; font-weight: 600; width: 20%;">Route</th>
              <th style="padding: 10px 8px; color: #64748b; font-weight: 600; width: 20%; text-align: center;">Status</th>
              <th style="padding: 10px 8px; color: #64748b; font-weight: 600; width: 15%; text-align: right;">Credits</th>
            </tr>
          </thead>
          <tbody>
            ${runs.map((r: any) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 8px; color: #1e293b; font-weight: 600;">${r.testCase?.title || "Untitled"}</td>
                <td style="padding: 12px 8px; color: #475569; font-family: monospace;">${r.targetRoute || "/"}</td>
                <td style="padding: 12px 8px; text-align: center;">
                  <span style="display: inline-block; padding: 4px 10px; font-size: 10px; font-weight: 700; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${(r.status || "passed") === "passed" ? "#ecfdf5" : "#fef2f2"}; color: ${(r.status || "passed") === "passed" ? "#047857" : "#b91c1c"};">
                    ${r.status || "passed"}
                  </span>
                </td>
                <td style="padding: 12px 8px; text-align: right; color: #6366f1; font-weight: 600;">${r.creditsUsed || 10}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Individual Case Recordings</h3>
        ${runs.map((r: any, idx: number) => `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <strong style="color: #0f172a; font-size: 14px;">${idx + 1}. ${r.testCase?.title || "Untitled"}</strong>
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${(r.status || "passed") === "passed" ? "#10b981" : "#ef4444"};">${(r.status || "passed").toUpperCase()}</span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin: 0 0 10px 0; font-family: monospace;">Route: ${r.targetRoute || "/"} | Session: ${r.testCase?.sessionId || "N/A"}</p>
            ${r.testCase?.sessionUrl ? `<a href="${r.testCase.sessionUrl}" style="font-size: 13px; color: #6366f1; font-weight: 600; text-decoration: none;">Watch Session Recording &rarr;</a>` : `<span style="font-size: 13px; color: #94a3b8;">No recording available</span>`}
          </div>
        `).join("")}
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Test Execution Report</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 32px; text-align: center; color: #ffffff; }
          .logo { font-size: 28px; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 8px; }
          .logo span { color: #818cf8; }
          .status-badge { display: inline-block; padding: 8px 16px; font-size: 14px; font-weight: 700; border-radius: 20px; background-color: ${overallStatusColor}; color: #ffffff; margin-top: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          .content { padding: 40px 32px; line-height: 1.6; }
          .content h2 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px; }
          .content p { font-size: 15px; color: #475569; margin-bottom: 24px; }
          
          .metrics-grid { display: flex; gap: 12px; margin-bottom: 32px; }
          .metric-card { flex: 1; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; padding: 16px; text-align: center; }
          .metric-label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.05em; }
          .metric-val { font-size: 20px; font-weight: 800; color: #0f172a; }
          .metric-val.passed { color: #10b981; }
          .metric-val.failed { color: #ef4444; }
          .metric-val.credits { color: #6366f1; }

          .test-details { background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 32px; }
          .detail-row { display: flex; margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
          .detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
          .detail-label { width: 140px; font-weight: 600; color: #64748b; flex-shrink: 0; }
          .detail-val { color: #1e293b; font-family: monospace; word-break: break-all; }

          .cta-btn { display: inline-block; background-color: #6366f1; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2); }
          .pdf-alert { background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 8px; padding: 14px 20px; margin-bottom: 32px; font-size: 14px; text-align: center; }
          .footer { background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Test<span>ly</span></div>
            <div style="font-size: 20px; font-weight: 700; margin-top: 8px;">Execution Dashboard</div>
            <div class="status-badge">${overallStatusLabel}</div>
          </div>
          .content { padding: 40px 32px; line-height: 1.6; }
          <div class="content">
            <h2>Hello ${user?.name || "Testly User"},</h2>
            <p>Your automated test case execution has finished. Below is the execution summary. A complete combined PDF report containing detailed metadata, terminal logs, and Playwright source scripts is attached to this email.</p>
            
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Total Runs</div>
                <div class="metric-val">${totalRuns}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Passed</div>
                <div class="metric-val passed">${passedRuns}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Failed</div>
                <div class="metric-val failed">${failedRuns}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Credits Used</div>
                <div class="metric-val credits">${totalCredits}</div>
              </div>
            </div>
            
            ${testDetailsHtml}

            <div class="pdf-alert" style="margin-top: 24px;">
              📎 <strong>Combined PDF Report Attached:</strong> We have compiled and attached <code>test_execution_report_${Date.now()}.pdf</code> containing full terminal logs and source code for all runs.
            </div>
          </div>
          <div class="footer">
            <p>This is an automated test notification sent from your Testly account.</p>
            <p>&copy; ${new Date().getFullYear()} Testly. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: `Testly Automation <${fromEmail}>`,
    to: user?.email || firstRun.user?.email,
    subject,
    html,
    attachments: [
      {
        filename: `test_execution_report_${Date.now()}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  console.log(`[EmailService] Combined automation report email sent successfully to ${user?.email || firstRun.user?.email} for ${totalRuns} run(s)`);
}
