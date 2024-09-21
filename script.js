async function sendEmail(data) {
    try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('rollno', data.rollno);
        formData.append('achievement', data.achievement);
        formData.append('date', data.date);
        formData.append('description', data.description);
        
        data.photos.forEach(photo => {
            formData.append('photos', photo);
        });

        const response = await fetch(`/netlify/functions/sendEmail`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to send email.');
        }
        
        const result = await response.text();
        console.log(result);
        document.getElementById('message').innerText = `Thank you, ${data.name}! Your achievement has been submitted.`;
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
        photos: Array.from(document.getElementById('photos').files) 
    };
    
    sendEmail(data);
    form.reset();
});
