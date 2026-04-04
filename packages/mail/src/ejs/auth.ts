const authEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><%= heading %></title>
	<style>
		:root {
			color-scheme: light;
		}

		body {
			margin: 0;
			padding: 0;
			background-color: #f4f7fb;
			font-family: Arial, Helvetica, sans-serif;
			color: #16324f;
		}

		.preheader {
			display: none;
			max-height: 0;
			overflow: hidden;
			opacity: 0;
		}

		.page {
			background: linear-gradient(180deg, #eef4fb 0%, #f8fafc 100%);
			margin: 0;
			padding: 32px 16px;
		}

		.shell {
			max-width: 620px;
			background-color: #ffffff;
			border-radius: 28px;
			overflow: hidden;
			box-shadow: 0 24px 70px rgba(18, 48, 83, 0.12);
		}

		.hero {
			background: linear-gradient(135deg, <%= primaryColor %> 0%, <%= primaryColor %> 100%);
			padding: 40px 40px 88px;
			position: relative;
		}

		.eyebrow {
			display: inline-block;
			padding: 8px 14px;
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.18);
			color: #ffffff;
			font-size: 12px;
			letter-spacing: 0.16em;
			text-transform: uppercase;
			font-weight: 700;
		}

		.hero-title {
			margin: 20px 0 12px;
			font-size: 34px;
			line-height: 1.15;
			color: #ffffff;
			font-weight: 800;
		}

		.hero-copy {
			margin: 0;
			max-width: 420px;
			font-size: 16px;
			line-height: 1.7;
			color: rgba(255, 255, 255, 0.9);
		}

		.content {
			padding: 0 32px 36px;
		}

		.code-card {
			margin-top: -52px;
			background: #f9fbfd;
			border: 1px solid #e8edf3;
			border-radius: 24px;
			padding: 28px;
			text-align: center;
		}

		.code-label {
			margin: 0 0 10px;
			font-size: 13px;
			font-weight: 700;
			letter-spacing: 0.2em;
			text-transform: uppercase;
			color: #5d7288;
		}

		.code-box {
			display: inline-block;
			margin: 8px 0 12px;
			padding: 16px 24px;
			border-radius: 18px;
			background: #ffffff;
			border: 1px solid #d8e2ec;
			box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
		}

		.code {
			font-size: 34px;
			line-height: 1;
			font-weight: 800;
			letter-spacing: 0.34em;
			color: <%= primaryColor %>;
			padding-left: 0.34em;
		}

		.helper-text {
			margin: 0;
			font-size: 15px;
			line-height: 1.7;
			color: #526477;
		}

		.note-wrap {
			padding: 32px 8px 8px;
		}

		.note {
			padding: 18px 20px;
			background: #f4f7fb;
			border-radius: 18px;
		}

		.note-title {
			margin: 0 0 8px;
			font-size: 15px;
			line-height: 1.6;
			color: #16324f;
			font-weight: 700;
		}

		.note-copy {
			margin: 0;
			font-size: 14px;
			line-height: 1.7;
			color: #5d7288;
		}

		.footer {
			margin: 28px 8px 0;
			font-size: 14px;
			line-height: 1.8;
			color: #6b7c8f;
		}

		.footer-brand {
			font-weight: 700;
			color: #16324f;
		}
	</style>
</head>
<body>
	<div class="preheader">
		<%= preheader %>
	</div>

	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="page">
		<tr>
			<td align="center">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="shell">
					<tr>
						<td>
							<div class="hero">
								<div class="eyebrow">
									<%= eyebrow %>
								</div>
								<h1 class="hero-title">
									<%= heading %>
								</h1>
								<p class="hero-copy">
									We are excited to have you here. Use the verification code below to continue securely.
								</p>
							</div>
						</td>
					</tr>

					<tr>
						<td class="content">
							<div class="code-card">
								<p class="code-label">
									Your verification code
								</p>
								<div class="code-box">
									<span class="code">
										<%= code %>
									</span>
								</div>
								<p class="helper-text">
									<%= helperText %>
								</p>
							</div>

							<div class="note-wrap">
								<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
									<tr>
										<td class="note">
											<p class="note-title">
												A quick note before you continue
											</p>
											<p class="note-copy">
												If you did not request this code, you can safely ignore this email. For your security, never share this code with anyone.
											</p>
										</td>
									</tr>
								</table>
							</div>

							<p class="footer">
								Thanks for choosing us,<br />
								<span class="footer-brand"><%= brandName %> Team</span>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`;

export { authEmailTemplate };
