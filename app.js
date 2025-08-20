// Replace these with your actual Supabase Project URL and Public API Key
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get HTML elements
const form = document.getElementById('upload-form');
const fileInput = document.getElementById('image-upload');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const resizedImage = document.getElementById('resized-image');
const imageUrlDisplay = document.getElementById('image-url');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const width = widthInput.value;
    const height = heightInput.value;

    if (!file || !width || !height) {
        alert('Please fill out all fields.');
        return;
    }

    // Generate a unique file name to avoid collisions
    const file_name = `${Date.now()}_${file.name}`;
    const file_path = `public/${file_name}`;

    // Upload the original file to Supabase storage
    const { data: uploadData, error: uploadError } = await _supabase.storage
        .from('images') // Use your bucket name
        .upload(file_path, file);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        alert('Image upload failed.');
        return;
    }

    // Construct the public URL for the uploaded image
    const { data: publicURLData } = _supabase.storage
        .from('images')
        .getPublicUrl(file_path);

    // Add the resizing query parameters to the URL
    const resizedURL = `${publicURLData.publicUrl}?width=${width}&height=${height}&quality=80`;

    // Display the resized image and its URL
    resizedImage.src = resizedURL;
    imageUrlDisplay.textContent = `Image URL: ${resizedURL}`;
});
