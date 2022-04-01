const getMailOptions = (receivers, subject, message) => {
  return {
    from: "ideasandfeedbackhub@gmail.com",
    to: receivers,
    subject,
    html: `<link
							rel="stylesheet"
							href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
							integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
							crossorigin="anonymous"
						/>
						<div style="position: relative; text-align: center">
							<img
								src="https://cdn.dribbble.com/users/225098/screenshots/14502339/media/15d5fd784601b442f9e9bba315fdd2e7.jpg?compress=1&resize=1200x900&vertical=top"
								style="width: 50%"
							/>
							<h4
								style="
									position: absolute;
									bottom: 1%;
									left: 50%;
									transform: translate(-50%, -50%);
								"
							>
								${message}
							</h4>
						</div>`,
  };
};

module.exports = getMailOptions;
