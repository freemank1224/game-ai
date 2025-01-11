document.getElementById('image-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const input = document.getElementById('image-input');
    if (input.files.length === 0) {
        alert('请选择一张图片');
        return;
    }

    const formData = new FormData();
    formData.append('image', input.files[0]);

    try {
        const response = await fetch('YOUR_API_ENDPOINT', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        document.getElementById('response').innerText = JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('response').innerText = '请求失败，请重试。';
    }
});
