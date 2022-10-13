const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(
  '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',
)

// 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


const msg = {
    to: "bradleyjhumble@gmail.com",
    from: 'no-reply@dealstryker.com',
    subject: 'Welcome to DealStryker',
    html: `<span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">Welcome to DealStryker,</span><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><br></span></div><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">We appreciate you as a member and would like to thank you for choosing&nbsp; our platform.<br> As a forward-thinking company, we are continually making improvements to our environment and appreciate feedback</span><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);">.&nbsp;</span></div><div dir="auto"><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);"><br></span></div><div dir="auto"><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);">If you have any questions, need assistance or have suggestions please feel free to reach out to me, thanks!</span></div><div dir="auto"><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);"><br></span></div><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">Regards,</span><div dir="auto"><br style="box-sizing: inherit; font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">Farhid Azari</span><br style="box-sizing: inherit; font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">CMO / Co-Founder</span></div><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><img src="cid:BF19D9A57BEE45398FF6E41974AA748D"><br></span></div></div>`,
  }
  sgMail
    .send(msg)
    .catch((err) => {
      console.log('SendGrid sending error: ', err)
    })
