document.getElementById('summarizeForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const url = document.getElementById('url').value;
    const videoId = getYouTubeVideoId(url);
    
    // Set the YouTube player URL
    document.getElementById('videoPlayer').src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    
    const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });
    const data = await response.json();
    const summaryElement = document.getElementById('summary');
    const downloadBtn = document.getElementById('downloadBtn');
    if (response.ok) {
        summaryElement.innerHTML = '';
        data.summaries.forEach(entry => {
            const p = document.createElement('p');
            p.innerHTML = `<a href="#" onclick="jumpToTime(${entry.start_time})">From ${formatTime(entry.start_time)} to ${formatTime(entry.end_time)}</a>: ${entry.summary}`;
            summaryElement.appendChild(p);
        });
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => {
            window.location.href = `http://localhost:5000/download_summary?doc_path=${data.doc_path}`;
        };
    } else {
        summaryElement.innerText = data.error;
        downloadBtn.style.display = 'none';
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function getYouTubeVideoId(url) {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : '';
}

function jumpToTime(seconds) {
    const player = document.getElementById('videoPlayer');
    player.src = player.src.split('?')[0] + `?start=${Math.floor(seconds)}&autoplay=1`;
}
