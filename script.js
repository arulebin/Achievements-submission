async function sendEmail(data) {
    try {
        const response = await fetch('/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to send email.');
        }
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const form = document.getElementById('achievementForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        rollno: document.getElementById('rollno').value,
        achievement: document.getElementById('achievement').value,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value,
        photos: Array.from(document.getElementById('photos').files).map(file => ({
            name: file.name,
            path: URL.createObjectURL(file)
        }))
    };
    sendEmail(data);
    document.getElementById('message').innerText = `Thank you, ${name}! Your achievement has been submitted. Photos: ${photoNames.join(', ')}`;
    console.log(name, rollno, achievement, date, description, photoNames);
    form.reset();
});
