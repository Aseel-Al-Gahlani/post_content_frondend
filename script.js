document.addEventListener('DOMContentLoaded', function () {
  
let posts = [];
    window.editPost = function (index) {
        const post = posts[index];
        document.getElementById('title').value = post.title;
        document.getElementById('content').value = post.content;
        posts.splice(index, 1);
        renderPosts();
    };

    // Delete post function
    window.deletePost = function (index) {
        posts.splice(index, 1);
        renderPosts();
    };
    ////////////////////////////////////////////////////

document.getElementById('mediaFiles').addEventListener('change', function(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('mediaPreview');
    previewContainer.innerHTML = '';

    Array.from(files).forEach(file => {
        const fileURL = URL.createObjectURL(file);
        let mediaElement;

        if (file.type.startsWith('image/')) {
            mediaElement = document.createElement('img');
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
        } else if (file.type.startsWith('audio/')) {
            mediaElement = document.createElement('audio');
            mediaElement.controls = true;
        }

        mediaElement.src = fileURL;
        previewContainer.appendChild(mediaElement);
    });
});
document.getElementById('postForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const mediaFiles = document.getElementById('mediaFiles').files;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);

    Array.from(mediaFiles).forEach(file => {
        formData.append('media_files[]', file);
    });

    const response = await fetch('http://localhost/post-content-system/post-content-system/public/api/posts', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
    });

    if (response.ok) {
        alert('Post created successfully');
        document.getElementById('postForm').reset();
        document.getElementById('mediaPreview').innerHTML = '';
        loadPosts();
    } else {
        alert('Failed to create post');
    }
});
async function loadPosts(page = 1) {
    const response = await fetch(`http://localhost/post-content-system/post-content-system/public/api/posts?page=${page}`);
    const data = await response.json();
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    data.data.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h2 class="post-title">${post.title}</h2>
            <p class="post-content">${post.content}</p>
            <p><strong>Category:</strong> ${post.category}</p>
            ${renderMedia(post.media_files)}
            <button onclick="editPost(${post.id})" class="btn btn-warning btn-sm">Edit</button>
            <button onclick="deletePost(${post.id})" class="btn btn-danger btn-sm">Delete</button>
        `;
        postsContainer.appendChild(postElement);
    });

    renderPagination(data);
}

function renderMedia(mediaFiles) {
    return mediaFiles.map(file => {
        if (file.endsWith('.jpg') || file.endsWith('.png')) {
            return `<img src="/storage/${file}" alt="Image">`;
        } else if (file.endsWith('.mp4')) {
            return `<video src="/storage/${file}" controls></video>`;
        } else if (file.endsWith('.mp3')) {
            return `<audio src="/storage/${file}" controls></audio>`;
        }
    }).join('');
}
function editPost(index) {
    const post = posts[index];
    document.getElementById('title').value = post.title;
    document.getElementById('content').value = post.content;
    document.getElementById('category').value = post.category;
    document.getElementById('postIndex').value = index;
    document.getElementById('submitBtn').textContent = 'Update Post';

    editingIndex = index;
}


function renderPagination(data) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let page = 1; page <= data.last_page; page++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item', page === data.current_page ? 'active' : '');
        pageItem.innerHTML = `<a class="page-link" href="#" onclick="loadPosts(${page})">${page}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

});

