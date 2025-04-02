export async function onRequestPost({ request, env }) {
    const body = await request.json();
    const { name, email, message } = body;
  
    if (!name || !email || !message) {
      return new Response("Missing fields", { status: 400 });
    }
  
    // Save to D1
    await env.MY_D1_DB.prepare(
      `INSERT INTO messages (name, email, message) VALUES (?, ?, ?)`
    ).bind(name, email, message).run();
  
    // Send email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@carringtonalex.com", // or your verified sender
        to: "ggsweeden00@gmail.com",   // your own inbox
        subject: "New Contact Form Submission",
        html: `
          <p>You received a new message from your website contact form.</p>
          <p>
            <strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Message:</strong><br>${message.replace(/\n/g, "<br>")}
          </p>
        `
      })
    });
  
    if (!emailResponse.ok) {
      console.error("Failed to send email:", await emailResponse.text());
      return new Response("Failed to send email", { status: 500 });
    }
  
    return new Response("Message stored and email sent!", { status: 200 });
  }
  