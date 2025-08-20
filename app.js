// Replace these with your actual Supabase Project URL and Public API Key
const SUPABASE_URL = 'https://vlfnufuqbfmywujwgfjb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsZm51ZnVxYmZteXd1andnZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTkxODksImV4cCI6MjA3MTIzNTE4OX0.n07xXKm2DQ1m1xdZYlwaHPnPzMLBxdMIVJaHp6Q_uOo';

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
    const requestedWidth = widthInput.value;
    const requestedHeight = heightInput.value;

    if (!file || !requestedWidth || !requestedHeight) {
        alert('Please fill out all fields.');
        return;
    }

    // Read the original dimensions of the uploaded image
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (readerEvent) => {
        const img = new Image();
        img.onload = async () => {
            const originalWidth = img.width;
            const originalHeight = img.height;

            // Generate a unique file name to avoid collisions
            const fileName = `${Date.now()}_${file.name}`;
            const filePath = `public/${fileName}`;

            // Upload the original file to Supabase storage
            const { data: uploadData, error: uploadError } = await _supabase.storage
                .from('images') // Your bucket name
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                alert('Image upload failed.');
                return;
            }

            // Construct the public URL for the uploaded image
            const { data: publicURLData } = _supabase.storage
                .from('images')
                .getPublicUrl(filePath);
            
            const originalURL = publicURLData.publicUrl;

            // Insert a record into the 'images' database table
            const { data: recordData, error: recordError } = await _supabase
                .from('images')
                .insert([{ 
                    original_url: originalURL,
                    original_width: originalWidth,
                    original_height: originalHeight
                }]);

            if (recordError) {
                console.error('Database Insert Error:', recordError);
                alert('Failed to save image record.');
                return;
            }

            // Add the resizing query parameters to the URL
            const resizedURL = `${originalURL}?width=${requestedWidth}&height=${requestedHeight}&quality=80`;

            // Display the resized image and its URL
            resizedImage.src = resizedURL;
            imageUrlDisplay.textContent = `Image URL: ${resizedURL}`;
        };
        img.src = readerEvent.target.result;
    };
});
