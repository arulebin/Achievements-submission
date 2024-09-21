const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');

const auth = {
    auth: {
        api_key: process.env.API_KEY,
        domain: process.env.DOMAIN
    }
};
const transporter = nodemailer.createTransport(mailgun(auth));

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const data = JSON.parse(body);

            const mailOptions = {
                from: 'postmaster@sandboxa2b0867851a84ee7862313e50e288bd0.mailgun.org',
                to: 'ebincreations@gmail.com',
                subject: 'Achievements Submission',
                text: `Name: ${data.name}\nRoll Number: ${data.rollno}\nAchievement: ${data.achievement}\nDate: ${data.date}\nDescription: ${data.description}`,
                attachments: data.photos.map(photo => ({
                    filename: photo.name,
                    path: photo.path 
                })),
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                res.status(200).send('Message sent: ' + info.messageId);
            } catch (error) {
                res.status(500).send('Error occurred: ' + error.message);
            }
        });
    } else {
        res.status(404).send('Not found');
    }
};