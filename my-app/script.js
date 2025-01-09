import { Client, Databases,Storage,Query, Account } from 'appwrite';
// Wait for the DOM to be ready before running the scripts
document.addEventListener("DOMContentLoaded", () => {
    const couponInput = document.getElementById('coupon-input');
    const applyButton = document.getElementById('coupon-button');
    const appliedCouponDiv = document.getElementById('applied-coupon');
    const couponNameSpan = document.getElementById('coupon-name');
    const removeCouponButton = document.getElementById('remove-coupon');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartTotalElement = document.getElementById('cart-total');
    const cartdiscount = document.getElementById('discount-amt');
  
    let appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon')) || null;
    console.log(appliedCoupon)
    
    
    

    

    // Reference to the contact form
    // Assuming you have a function to fetch coupons from the database
    console.log("arthoutest")
    async function fetchCoupon(couponCode) {
        try {
            const response = await databases.listDocuments(DATABASE_ID,'677b030500069bc11608', [
                Query.equal('couponcode', couponCode),
            ]);
            return response.documents[0]; // Return the first matching coupon
        } catch (error) {
            console.error('Error fetching coupon:', error);
            return null;
        }
    }

    // Get references to elements
    

    

    // Function to calculate and update totals
    function updateCartTotals() {
        const cartSubtotal = parseFloat(cartSubtotalElement.textContent.replace('£', ''));
        let total = cartSubtotal;
        console.log(appliedCoupon)

        if (appliedCoupon && appliedCoupon.type === 'discount') {
            console.log(total,cartSubtotal)
            total -= (cartSubtotal * appliedCoupon.amount) / 100;
            cartdiscount.textContent = `-£${(cartSubtotal * appliedCoupon.amount / 100).toFixed(2)}`;
        }
        if (appliedCoupon && appliedCoupon.type === 'fixed') {
            console.log(total,cartSubtotal)
            total = (cartSubtotal -appliedCoupon.amount);
            cartdiscount.textContent = `-£${( appliedCoupon.amount)}`;
        }

        cartTotalElement.textContent = `£${total.toFixed(2)}`;
    }


    // Apply coupon
    if (applyButton){
        applyButton.addEventListener('click', async () => {
            const cartSubtotal = parseFloat(cartSubtotalElement.textContent.replace('£', ''));
            let total = cartSubtotal;
            const couponCode = couponInput.value.trim();
    
            if (!couponCode) {
                alert('Please enter a coupon code.');
                return;
            }
    
            // Fetch and validate the coupon
            const coupon = await fetchCoupon(couponCode);
            if (!coupon) {
                alert('Coupon not found.');
                return;
            }
    
            if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
                alert('Coupon has expired.');
                return;
            }
    
            if (coupon.uses <= 0) {
                alert('Coupon has been used up.');
                return;
            }
            if (total<coupon.minpurchase){
                alert(`Coupon invalid with current purchase. Purchase must be larger than £${coupon.minpurchase.toFixed(2)}.`);
                return;
    
            }
    
            // Apply the coupon
            appliedCoupon = coupon;
            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    
            // Update the UI
            appliedCouponDiv.style.display = 'block';
            couponNameSpan.textContent = `${appliedCoupon.couponcode} (${appliedCoupon.type === 'discount' ? appliedCoupon.amount + '% off' : appliedCoupon.amount + '£ off'})`;
    
            couponInput.value = '';
            
    
            // Update cart totals
            updateCartTotals();
        });
    

    }
    
    // Remove coupon
    if (removeCouponButton){
        removeCouponButton.addEventListener('click', () => {
            appliedCoupon = null;
            appliedCouponDiv.style.display = 'none';
            localStorage.removeItem('appliedCoupon');
            cartdiscount.textContent = '£0.00';
            updateCartTotals();
        });

    }
   





    const form = document.getElementById('contact-form');

    // Event listener for form submission
    if (form){
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
    
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
    
            
            try {
                // Add the contact message to the Contacts collection inside the Products database
                const response = await databases.createDocument(
                    '677a62e3001aa8bc5ceb',     // Replace with your Products database ID
                    '677aad4c0013b74d8dac',   // The collection ID for Contacts
                    'unique()',             // ID for the document (can be generated uniquely)
                    {
                        name: name,
                        email: email,
                        subject: subject,
                        text: message,
                        createdAt: new Date().toISOString(), // Timestamp for the submission
                    }
                );
                console.log('Subscription successful:', response);
    
                // Show success message or do something else on success
                alert('Message sent successfully!');
                // Optionally reset the form
                form.reset();
            } catch (error) {
                // Handle error
                console.error('Error sending message:', error);
                alert('Error sending message. Please try again.');
            }
        });

    }



    console.log("herethisone")
    // Script for navigation bar
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');

    if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        });
    }

    if (close) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    }
    
    // Appwrite Client Setup
    const client = new Client();
    client
        .setEndpoint('https://reliqueantiques.github.io/') // Replace with your Appwrite endpoint
        .setProject('677a615c000e7be7bcd4'); // Replace with your Appwrite project ID

    const databases = new Databases(client);
    const storage = new Storage(client);
    const account = new Account(client);

    const DATABASE_ID = '677a62e3001aa8bc5ceb';  // Replace with your actual Appwrite database ID
    const COLLECTION_ID = '677a62f2000ad4c4a861';  // Replace with your actual Appwrite collection ID
    const BUCKET_ID = '677a7743002925218720';  // Replace with your actual Appwrite bucket ID
    const NEWSLETTER_COLLECTION_ID = '677a99d6001b1b4170da'; // Collection ID for the newsletter


    let currentPage = 1; // Default to page 1
    const productsPerPage = 8; // Number of products per page
    let currentSearchTerm = '';
    let currentSortOption = 'low-to-high'; // Default to 'low-to-high' sorting option
    async function subscribeToNewsletter() {
        const email = document.getElementById('newsletter-email').value;

        if (!email || !validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            // Create a new document in Appwrite collection with the email
            const response = await databases.createDocument(
                DATABASE_ID,
                NEWSLETTER_COLLECTION_ID,
                'unique()', // Generate a unique ID for the document
                {
                    Email: email, // Store the email in the 'email' field
                }
            );
            
            console.log('Subscription successful:', response);
            alert('Thank you for subscribing! You will receive our updates via email.');
            document.getElementById('newsletter-email').value = ''; // Clear the input field

        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            alert('Oops! Something went wrong. Please try again.');
        }
    }

    // Basic email validation (could be expanded)
    function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }

    // Add event listener to the "Sign Up" button
    const subscribeButton = document.getElementById('subscribe-btn');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', subscribeToNewsletter);
    }

    // Function to fetch and display products
    async function fetchProducts() {
        try {
            console.log("here")
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
            let products = response.documents;
            // Apply filters
             // Apply search term filter
        if (currentSearchTerm) {
            products = products.filter(product =>
                product.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(currentSearchTerm.toLowerCase())
            );
        }

        // Apply sorting based on the selected option
        if (currentSortOption === 'low-to-high') {
            products.sort((a, b) => a.price - b.price); // Sort by price low to high
            
        } else if (currentSortOption === 'high-to-low') {
            products.sort((a, b) => b.price - a.price); // Sort by price high to low
        } else if (currentSortOption === 'newest') {
            console.log(products.map(product => product.dateposted));
            products.sort((a, b) => new Date(b.dateposted) - new Date(a.dateposted)); // Sort by newest
            console.log(products)
        } else if (currentSortOption === 'oldest') {
            products.sort((a, b) => new Date(a.dateposted) - new Date(b.dateposted)); // Sort by oldest
            console.log(products)
        }

            const totalProducts = products.length;
            const totalPages = Math.ceil(totalProducts / productsPerPage);

            // Determine the range of products to display for the current page
            const startIndex = (currentPage - 1) * productsPerPage;
            const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
            const productsToDisplay = products.slice(startIndex, endIndex);

            // Get the product container and clear it
            const productContainer = document.getElementById('product-container');
            productContainer.innerHTML = ''; // Clear previous products if any

            // Loop through each product and fetch the image by imageId
            for (const product of productsToDisplay) {
                const productLink = `sproducts.html?id=${product.$id}`; // Link to product details page

                // Fetch the image URL using the imageId stored in the product document
                const fileResponse = await storage.getFileView(BUCKET_ID, product.image_id);
                const imageUrl = fileResponse.href; // Image URL for the product

                // Create the product container div
                const productElement = document.createElement('div');
                productElement.classList.add('pro'); // Add 'pro' class to the div

                // Add click event for redirection when the product is clicked
                productElement.setAttribute('onclick', `window.location.href='${productLink}'`);

                // Insert product details into the created div
                productElement.innerHTML = `
                    <img src="${imageUrl}" alt="${product.name}">
                    <div class="des">
                        <span>${product.brand}</span>
                        <h5>${product.name}</h5>
                        <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <h4>£${parseFloat(product.price).toFixed(2)}</h4>

                    </div>
                    <a href="${productLink}"><i class="fal fa-shopping-cart cart"></i></a>
                `;

                // Append the product element to the product container
                productContainer.appendChild(productElement);
            }

            // Update pagination links
            updatePagination(totalPages);

        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Function to update pagination
    function updatePagination(totalPages) {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = ''; // Clear existing pagination

        // Display previous button if not on the first page
        if (currentPage > 1) {
            const prevButton = document.createElement('a');
            prevButton.href = "#";
            prevButton.innerHTML = `<i class="fal fa-long-arrow-alt-left"></i>`;
            prevButton.onclick = (e) => {
                e.preventDefault(); // Prevent default anchor behavior
                changePage(currentPage - 1);
            };
            paginationContainer.appendChild(prevButton);
        }

        // Display page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = "#";
            pageLink.innerHTML = i;
            pageLink.onclick = (e) => {
                e.preventDefault(); // Prevent default anchor behavior
                changePage(i);
            };
            if (i === currentPage) {
                pageLink.classList.add('active'); // Highlight the current page
            }
            paginationContainer.appendChild(pageLink);
        }

        // Display next button if not on the last page
        if (currentPage < totalPages) {
            const nextButton = document.createElement('a');
            nextButton.href = "#";
            nextButton.innerHTML = `<i class="fal fa-long-arrow-alt-right"></i>`;
            nextButton.onclick = (e) => {
                e.preventDefault(); // Prevent default anchor behavior
                changePage(currentPage + 1);
            };
            paginationContainer.appendChild(nextButton);
        }
    }
        // Initialize Appwrite client
    
    // Admin collection details
    
    
    
    console.log('here')
        // Show the sign-in modal on page load
        // DOM Elements
    const editProductBtn = document.getElementById('edit-product-btn');
    const editBlogBtn = document.getElementById('edit-blog-btn');
    const logoutBtns = document.getElementsByClassName('logout-btn');
    
    const modal = document.getElementById('edit-modal');
    const modal1 = document.getElementById('edit-modal1');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalBtn1 = document.getElementById('close-modal-btn1');
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const adminWelcome = document.getElementById('admin-welcome');
    const pageHeader = document.getElementById('page-header');
    const errorMessage = document.getElementById('error-message');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if the user is already logged in
    const checkSession = async () => {
        try {
            const session = await account.getSession('current');
            console.log('Session found:', session);
            if (session) {
                if (logoutBtns.length>0){
                    for (let i = 0; i < logoutBtns.length; i++) {
                        logoutBtns[i].classList.add('show');
                    }

                }
                
                if (window.location.pathname.includes("sproducts.html")){
                    editProductBtn.style.display = 'block';


                }
                if (window.location.pathname.includes("blog-details.html")){
                    editBlogBtn.style.display = 'block';


                }
               
            }

            // If session exists, hide login and show welcome message
            if (loginContainer){
                loginContainer.style.display = 'none';

            }
            if(adminWelcome){
                adminWelcome.style.display = 'flex';

            }
            
        } catch (error) {
            console.log(error);
            if (loginContainer){
                loginContainer.style.display = 'block';
            }
            if (adminWelcome){
                adminWelcome.style.display = 'none';
            }
        }
    };
    const productForm = document.getElementById('product-upload-form');
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const price = parseFloat(document.getElementById('price').value);
            const brand = document.getElementById('brand').value;
            const Feature = document.getElementById('editpfeature').checked;
            const images = [document.getElementById('image1').files[0], document.getElementById('image2').files[0], document.getElementById('image3').files[0], document.getElementById('image4').files[0]];

            try {
                // Upload images to Appwrite storage and get their IDs
                const imageIds = [];
                for (const image of images) {
                    if (image) {
                        const response = await storage.createFile(BUCKET_ID, 'unique()', image);
                        imageIds.push(response.$id);
                    } else {
                        imageIds.push(null); // Placeholder for missing images
                    }
                }

                // Add product to Appwrite database
                const product = {
                    name,
                    description,
                    price,
                    brand,
                    Feature,
                    image_id: imageIds[0],
                    image_id1: imageIds[1],
                    image_id2: imageIds[2],
                    image_id3: imageIds[3],
                    dateposted: new Date().toISOString(),
                };

                const result = await databases.createDocument(DATABASE_ID,COLLECTION_ID , 'unique()', product);
                console.log('Product added:', result);

                alert('Product uploaded successfully!');
                productForm.reset(); // Clear the form
                fetchProducts();
            } catch (error) {
                console.error('Error uploading product:', error);
                alert('Failed to upload product. Please try again.');
            }
        });
    }
    const blogForm = document.getElementById('blog-upload-form');
    const imageGroup = document.getElementById('image-group');
    const addMoreImagesButton = document.getElementById('add-more-images');

    let imageCount = 1;  // Start counting from image1

    // Add more image input fields dynamically
    if (addMoreImagesButton){
        addMoreImagesButton.addEventListener('click', () => {
            imageCount++;
            const newImageField = document.createElement('div');
            newImageField.classList.add('form-group');
            newImageField.innerHTML = `
                <label for="image${imageCount}">Image ${imageCount}</label>
                <input type="file" id="blogimage${imageCount}" name="blogimage${imageCount}" accept="image/*">
            `;
            imageGroup.appendChild(newImageField);
        });
    }
    

    if (blogForm) {
        blogForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const date = document.getElementById('date').value;
            const excerpt = document.getElementById('excerpt').value;
            const content = document.getElementById('content').value;
            const images = [];

            // Collect all image files
            for (let i = 1; i <= imageCount; i++) {
                const image = document.getElementById(`blogimage${i}`).files[0];
                console.log(document.getElementById(`blogimage${i}`).files)
                console.log(image);
                if (image) {
                    images.push(image);
                }
            }

            try {
                // Upload images to Appwrite storage and get their IDs
                const imageIds = [];
                for (const image of images) {

                    const response = await storage.createFile(BUCKET_ID, 'unique()', image);
                    imageIds.push(response.$id);
                }
                console.log(imageIds);

                // Add blog to Appwrite database
                const blog = {
                    Title:title,
                    Author:author,
                    Date:date,
                    Excerpt:excerpt,
                    content,
                    image: imageIds, // Store image ids as an array
                    
                };

                const result = await databases.createDocument(DATABASE_ID, '677bcc1e00009ca0d635', 'unique()', blog);
                console.log('Blog added:', result);

                alert('Blog uploaded successfully!');
                blogForm.reset(); // Clear the form
                imageGroup.innerHTML = `
                    <div class="form-group">
                        <label for="image1">Image 1</label>
                        <input type="file" id="blogimage1" name="image1" accept="image/*" required>
                    </div>
                `;
                imageCount = 1; // Reset the image counter
                fetchAndRenderBlogs();
            } catch (error) {
                console.error('Error uploading blog:', error);
                alert('Failed to upload blog. Please try again.');
            }
        });
    }

    const couponForm = document.getElementById('coupon-upload-form');
    if (couponForm) {
        couponForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const couponcode = document.getElementById('couponcode').value;
            const uses = parseInt(document.getElementById('uses').value);
            const expiry = document.getElementById('expiry').value;
            const type = document.getElementById('type').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const minpurchase = parseFloat(document.getElementById('minpurchase').value);

            try {
                // Add coupon to Appwrite database
                const coupon = {
                    couponcode,
                    uses,
                    expiry,
                    type,
                    amount,
                    minpurchase,
                    
                };

                const result = await databases.createDocument(
                    DATABASE_ID,
                    '677b030500069bc11608', // Coupons collection ID
                    'unique()', // Generate a unique ID for the coupon
                    coupon
                );
                console.log('Coupon added:', result);

                alert('Coupon uploaded successfully!');
                couponForm.reset(); // Clear the form
                fetchActiveCoupons();
            } catch (error) {
                console.error('Error uploading coupon:', error);
                alert('Failed to upload coupon. Please try again.');
            }
        });
    }
    async function fetchActiveCoupons() {
        try {
            // Get the current date in ISO format
            const currentDate = new Date().toISOString();
    
            // Fetch active coupons from the database
            const response = await databases.listDocuments(
                DATABASE_ID, // Replace with your database ID
                '677b030500069bc11608', // Replace with your coupons collection ID
                [
                    Query.greaterThan('expiry', currentDate) // Filter coupons with expiry date greater than current date
                ]
            );
    
            // Get the coupon container
            const couponContainer = document.getElementById('coupon-container');
            const nextCouponButton = document.getElementById('next-coupon');
    
            // Clear any existing content
            couponContainer.innerHTML = '';
    
            // Check if there are any active coupons
            if (response.documents.length === 0) {
                couponContainer.innerHTML = '<p>No active coupons available.</p>';
                nextCouponButton.style.display = 'none'; // Hide the Next Coupon button
                return;
            }
    
            // Initialize the current coupon index
            let currentCouponIndex = 0;
    
            // Function to display the current coupon
            function displayCoupon(index) {
                const coupon = response.documents[index];
                const couponElement = document.createElement('div');
                couponElement.classList.add('coupon');
    
                // Create and append coupon code
                const couponCode = document.createElement('h4');
                couponCode.textContent = coupon.couponcode;
                couponElement.appendChild(couponCode);
    
                // Create and append coupon type
                const couponType = document.createElement('p');
                couponType.textContent = `Type: ${coupon.type === 'fixed' ? 'Fixed Amount' : 'Percentage Discount'}`;
                couponElement.appendChild(couponType);
    
                // Create and append coupon amount
                const couponAmount = document.createElement('p');
                couponAmount.textContent = `Amount: ${coupon.amount}`;
                couponElement.appendChild(couponAmount);
    
                // Create and append minimum purchase
                const minPurchase = document.createElement('p');
                minPurchase.textContent = `Minimum Purchase: £${coupon.minpurchase}`;
                couponElement.appendChild(minPurchase);
    
                // Create and append close button
                const closeButton = document.createElement('button');
                closeButton.textContent = '×';
                closeButton.classList.add('close-button');
                closeButton.addEventListener('click', async () => {
                    // Remove the coupon element
                    couponElement.remove();
                    // Optionally, remove the coupon from the database
                    
                    await databases.deleteDocument(DATABASE_ID, '677b030500069bc11608', coupon.$id);
                    fetchActiveCoupons();
                });
                couponElement.appendChild(closeButton);
    
                // Append the coupon element to the container
                couponContainer.appendChild(couponElement);
            }
    
            // Display the first coupon
            displayCoupon(currentCouponIndex);
    
            // Event listener for the Next Coupon button
            nextCouponButton.addEventListener('click', () => {
                // Increment the index and wrap around if necessary
                currentCouponIndex = (currentCouponIndex + 1) % response.documents.length;
                // Clear the container and display the next coupon
                couponContainer.innerHTML = '';
                displayCoupon(currentCouponIndex);
            });
    
        } catch (error) {
            console.error('Error fetching active coupons:', error);
            const couponContainer = document.getElementById('coupon-container');
            couponContainer.innerHTML = '<p>Failed to load active coupons. Please try again later.</p>';
        }
    }
    
    // Call the function to fetch and display active coupons
    if (window.location.pathname.includes("administration.html")) {
        fetchActiveCoupons();
    }
    


    async function fetchBlogs() {
        try {
          const response = await databases.listDocuments(DATABASE_ID, '677bcc1e00009ca0d635');
          const blogs = response.documents;
      
          // Render the blogs
          return blogs
        } catch (error) {
          console.error("Error fetching blogs:", error);
        }
    }
      

      // Render blogs to the DOM
      let currentPage1 = 1;

      let blogsPerPage; // Declare the variable globally

        // Check if we're on 'blogs.html' or 'administration.html'
      if (window.location.pathname.includes("blog.html")) {
            blogsPerPage = 4;  // Display 4 blogs at a time on blogs.html
      } else if (window.location.pathname.includes("administration.html")) {
            blogsPerPage = 1;  // Display 1 blog at a time on administration.html
      }
      
      // Function to render the blogs on the current page
      async function renderBlogs(blogs) {
          const blogContainer = document.getElementById("blog-container");
          blogContainer.innerHTML = ""; // Clear existing content
      
          // Calculate the range of blogs to display based on the current page
          const startIndex = (currentPage1 - 1) * blogsPerPage;
          const endIndex = currentPage1 * blogsPerPage;
          const blogsToDisplay = blogs.slice(startIndex, endIndex);
      
          // Loop through the blogs and display them
          for (const blog of blogsToDisplay) {
              // Fetch the blog image URL
              const imageUrl = await getImageURL(blog.image);
              console.log(blog.image);
      
              // Create the blog box
              const blogBox = document.createElement("div");
              blogBox.classList.add("blog-box");
              const formattedDate = formatDate(blog.Date);
      
              blogBox.innerHTML = `
                  <div class="blog-img">
                      <img src="${imageUrl}" alt="${blog.Title}">
                  </div>
                  <div class="blog-details">
                      <h4>${blog.Title}</h4>
                      <p>${blog.Excerpt}</p>
                      <a href="blog-details.html?id=${blog.$id}">CONTINUE READING</a>
                  </div>
                  <h1>${formattedDate}</h1>
              `;
      
              // Append to container
              blogContainer.appendChild(blogBox);
          }
      
          // Render pagination links
          renderPagination(blogs.length);
      }
      function renderPagination(totalBlogs) {
            let paginationContainer;

            if (window.location.pathname.includes("administration.html")) {
                const paginationElements = document.querySelectorAll("#pagination");
                paginationContainer = paginationElements[1]; // Access the second element
            } else {
                paginationContainer = document.getElementById("pagination");
            }

            paginationContainer.innerHTML = ""; // Clear existing pagination

        
            const totalPages = Math.ceil(totalBlogs / blogsPerPage);
            
            // Create "Previous" button
            const prevButton = document.createElement("a");
            prevButton.href = "#";
            prevButton.innerHTML = "<i class='fal fa-long-arrow-alt-left'></i>";
            prevButton.addEventListener("click", (event) => {
                event.preventDefault();
                if (currentPage1 > 1) {
                    currentPage1--;
                    fetchAndRenderBlogs();
                }
            });
            paginationContainer.appendChild(prevButton);
        
            // Create page numbers
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("a");
                pageButton.href = "#";
                pageButton.innerHTML = i;
                if (i === currentPage1) {
                    pageButton.classList.add("active");
                }
                pageButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    currentPage1 = i;
                    fetchAndRenderBlogs();
                });
                paginationContainer.appendChild(pageButton);
            }
        
            // Create "Next" button
            const nextButton = document.createElement("a");
            nextButton.href = "#";
            nextButton.innerHTML = "<i class='fal fa-long-arrow-alt-right'></i>";
            nextButton.addEventListener("click", (event) => {
                event.preventDefault();
                if (currentPage1 < totalPages) {
                    currentPage1++;
                    fetchAndRenderBlogs();
                }
            });
            paginationContainer.appendChild(nextButton);
        }
    
      function formatDate(dateString) {
        console.log(dateString)
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}/${month}`;
      }
      function formatDate1(dateString) {
        console.log(dateString);
        const date = new Date(dateString);
        
        // Get the day, month, and year
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = date.getFullYear(); // Get the full year
        
        // Return the date in day/month/year format
        return `${day}/${month}/${year}`;
      }
      
      // Fetch image URLs from Appwrite Storage
        async function getImageURLs(imageList) {
            try {
                const imageUrls = [];
                
                // Loop through all image IDs and get their URLs
                for (const imageId of imageList) {
                    const result = await storage.getFileView(BUCKET_ID, imageId);
                    imageUrls.push(result.href); // Store the image URL
                }
                return imageUrls; // Return the list of image URLs
            } catch (error) {
                console.error("Error fetching images:", error);
                return ["img/placeholder.jpg"]; // Return fallback image if there's an error
            }
        }
      // Fetch the image URL from Appwrite Storage
      async function getImageURL(imageList) {
        try {
          // Take the first image ID from the list
          const firstImageId = Array.isArray(imageList) && imageList.length > 0 ? imageList[0] : null;
          console.log("First Image ID:", firstImageId);
      
          if (!firstImageId) {
            throw new Error("No image available");
          }
      
          // Fetch the file view URL using the correct method
          const result = await storage.getFileView(BUCKET_ID, firstImageId);
          console.log("File View Response:", result);
      
          return result.href; // Appwrite-generated preview URL
        } catch (error) {
          console.error("Error fetching image URL:", error);
          return "img/placeholder.jpg"; // Fallback image
        }
    }
    async function fetchAndRenderBlogs() {
        // Fetch all blogs (you may want to modify this to fetch a limited number of blogs per page)
        const blogs = await fetchBlogs(); // Assuming this function fetches all blogs
        renderBlogs(blogs);
    }
      // Load blogs on page load
    if (window.location.pathname.includes("blog.html")||window.location.pathname.includes("administration.html")) {

        fetchAndRenderBlogs();
    }
    // Get blog ID from the URL
    const urlParams1 = new URLSearchParams(window.location.search);
    const blogId = urlParams1.get("id");


    if (!blogId) {
        if (window.location.pathname.includes("blog-details.html")) {

            document.getElementById("blog-content").innerHTML = "<h1>Blog not found!</h1>";
            throw new Error("No blog ID provided in URL");
        }
        
    }

    // Fetch blog details
    async function fetchBlogDetails(blogId) {
        try {
            const blog = await databases.getDocument(DATABASE_ID, '677bcc1e00009ca0d635', blogId);

            // Fetch the main image
            const imageUrls = await getImageURLs(blog.image);

            // Render the blog content
            renderBlogDetails(blog, imageUrls);
        } catch (error) {
            console.error("Error fetching blog details:", error);
            document.getElementById("blog-content").innerHTML = "<h1>Error loading blog details.</h1>";
        }
    }
    // Render blog details on the page
    function renderBlogDetails(blog, imageUrls) {
        let contentParts = blog.content.split('\n'); // Assuming each paragraph is separated by a newline
    
        let blogContent = `
            <div class="blog-details-header">
                <h1>${blog.Title}</h1>
                <h5>${blog.Author}</h5>
                <h5>${blog.Excerpt}</h5>
            </div>
            <div class="blog-images">
        `;
    
        let imageIndex = 0;
        let textIndex = 0;
        let b=false;
    
        // Loop through the content parts and alternate between text and images
        while (textIndex < contentParts.length || imageIndex < imageUrls.length) {
            // If both text and image exist, alternate between them
            if (imageIndex < imageUrls.length && textIndex < contentParts.length) {
                if (imageIndex%2===0){
                    blogContent += `
                    <div class="blog-image ${imageIndex % 2 === 0 ? 'left' : 'right'}">
                        <img src="${imageUrls[imageIndex]}" alt="Image ${imageIndex + 1}">
                    </div>
                    <div class="blog-text">
                        <p>${contentParts[textIndex]}</p>
                    </div>
                    `;

                }else{
                    blogContent += `
                    <div class="blog-text">
                        <p>${contentParts[textIndex]}</p>
                    </div>
                    <div class="blog-image ${imageIndex % 2 === 0 ? 'left' : 'right'}">
                        <img src="${imageUrls[imageIndex]}" alt="Image ${imageIndex + 1}">
                    </div>
                    `;
                    
                }
                
                imageIndex++;
                textIndex++;
            }
            // If only images are left, add them in a row
            
            else if (imageIndex < imageUrls.length) {
                if(b===false){
                    blogContent += `<div class="blog-image-row">`; // Start the row
                }
                b=true;
                
                    
                
            
                blogContent += `
                    <div class="blog-image-only">
                        <img src="${imageUrls[imageIndex]}" alt="Image ${imageIndex + 1}">
                    </div>
                `;
            
                imageIndex++;
            
                // Close the row if this is the last image or if it's the final image in the list
                if (imageIndex === imageUrls.length) {
                    blogContent += `</div>`; // Close the row
                }
            }
            
            
            // If only text is left, create full-width text blocks
            else if (textIndex < contentParts.length) {
                blogContent += `
                    <div class="blog-text-full-width">
                        <p>${contentParts[textIndex]}</p>
                    </div>
                `;
                textIndex++;
            }
        }
    
        blogContent += `
            </div>
            <div class="blog-details-date">
                <h4>Published on: ${formatDate1(blog.Date)}</h4>
            </div>
        `;
    
        document.getElementById("blog-content").innerHTML = blogContent;
    }
    
    
    if (window.location.pathname.includes("blog-details.html")) {
            fetchBlogDetails(blogId);
            console.log("woo")

    }
    

    if (loginForm) {
        // Event listener for login form submission
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;
            checkSession();

            try {
                const session = await account.createEmailPasswordSession(email, password);
                console.log('Session created successfully:', session);

                // Hide login form and show the admin panel
                loginContainer.style.display = 'none';
                adminWelcome.style.display = 'block';
                pageHeader.innerHTML = `<h2>Welcome to the Admin Page</h2><p>You are logged in</p>`;
                const welcomeMessage = document.querySelector('#admin-welcome h3');
                if (welcomeMessage) {
                    welcomeMessage.textContent = 'Welcome to the Admin Page'; // Update the text
                }
                

                // Redirect to admin page (if desired)
                // window.location.href = 'administration.html';
            } catch (error) {
                console.error('Error creating session:', error);
                errorMessage.textContent = 'Incorrect Email or Password';
                errorMessage.style.display = 'block';
            }
        });
    }
    

    if (logoutBtns.length > 0) {
        for (let i = 0; i < logoutBtns.length; i++) {
            const logoutBtn = logoutBtns[i];
            
            logoutBtn.addEventListener('click', async () => {
                try {
                    // Delete current session
                    await account.deleteSession('current');
                    
                    // Hide all logout buttons by removing 'show' class
                    for (let j = 0; j < logoutBtns.length; j++) {
                        logoutBtns[j].classList.remove('show');
                    }

                    // Redirect to the login page (administration.html)
                    

                    // Update welcome message if any
                    const welcomeMessage = document.querySelector('#admin-welcome h3');
                    if (welcomeMessage) {
                        welcomeMessage.textContent = 'Admin Login'; // Update the text
                    }
                } catch (error) {
                    console.error('Error logging out:', error);
                }
            });
        }
    }


    // Event listener for logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await account.deleteSession('current');
                if (logoutBtns.length>0){
                    for (let i = 0; i < logoutBtns.length; i++) {
                        logoutBtns[i].classList.remove('show');
                    }

                }
                window.location.href = 'administration.html'; // Redirect back to login page
                const welcomeMessage = document.querySelector('#admin-welcome h3');
                if (welcomeMessage) {
                    welcomeMessage.textContent = 'Admin Login'; // Update the text
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    }

    // Run the session check on page load
    checkSession();
    console.log("checked")
    // Function to change the page when a pagination link is clicked
    async function changePage(pageNumber) {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        const totalDocuments = response.total; // This gives you the total number of documents in the collection

        console.log("changing")
        // Only change page if the number is valid
        console.log(Math.ceil(totalDocuments / productsPerPage))
        if (pageNumber >= 1 && pageNumber <= Math.ceil(totalDocuments / productsPerPage)) {
            currentPage = pageNumber;
            console.log(pageNumber)
            fetchProducts(); // Fetch products for the new page
        }
    }
    if (window.location.pathname.includes("shop.html") || window.location.pathname.includes("administration.html")) {
        const filterOptions = document.getElementById('filter-options');
        const searchBar = document.getElementById('search-bar');
        
        // Only attach event listeners if the elements exist
        if (filterOptions) {
            filterOptions.addEventListener('change', (e) => {
                currentSortOption = e.target.value;
                fetchProducts(); // Re-fetch products with the new sorting option
            });
        }

        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value;
                fetchProducts(); // Re-fetch products with the new search term
            });
        }
        fetchProducts();
    }
    
    console.log("nooo")
    if (editProductBtn||closeModalBtn){
        editProductBtn.addEventListener('click', async() => {
            modal.style.display = 'block';
            await fetchProductDetails1();
        });
    
        // When the user clicks on the close button, hide the modal
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });


    }
    console.log(editBlogBtn,closeModalBtn1)
    if (editBlogBtn||closeModalBtn1){
        editBlogBtn.addEventListener('click', async() => {
            modal1.style.display = 'block';
            console.log("This should also",editBlogBtn,closeModalBtn1)
            await fetchBlogDetails1();
        });
    
        // When the user clicks on the close button, hide the modal
        closeModalBtn1.addEventListener('click', () => {
            modal1.style.display = 'none';
        });
        window.addEventListener('click', (event) => {
            if (event.target === modal1) {
                modal1.style.display = 'none';
            }
        });

    }
    
        
    // Function to check if the user has an active session

    checkSession();


    // Call the fetchProducts function when the page is loaded
    if (window.location.pathname.includes("shop.html") || window.location.pathname.includes("administration.html")) {
        window.onload = fetchProducts;
    }





    

    // Get product ID from the URL
    const urlParams = new URLSearchParams(window.location.search);

    
    
    const productId = urlParams.get('id');
    console.log(productId)
    const editProductForm = document.getElementById("edit-product-form");
    const editBlogForm = document.getElementById("edit-blog-form");
    console.log(editBlogForm)
    if(editBlogForm){
        console.log("here")
        editBlogForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent the form's default submission behavi
            console.log("100%here thanks")
            
        
            // Get the form values
            const updatedTitle = document.getElementById("edit-blog-title").value;
            const updatedAuthor = document.getElementById("edit-blog-author").value;
            
            const updatedExcerpt = document.getElementById("edit-blog-excerpt").value;
            const updatedContent = document.getElementById("edit-blog-content").value;
        
            const updatedBlog = {
                Title: updatedTitle,
                Author: updatedAuthor,
                
                Excerpt: updatedExcerpt,
                content: updatedContent,
            };
        
            try {
                // Update the blog in the database
                const response = await databases.updateDocument(DATABASE_ID, "677bcc1e00009ca0d635", blogId, updatedBlog);
                
                console.log("Blog updated successfully:", response);
                alert("Blog updated successfully!");
                modal1.style.display = "none"; // Close the modal
                fetchBlogDetails(blogId);
                
            } catch (error) {
                console.error("Error updating blog:", error);
                alert("Failed to update blog. Please try again.");
            }
        });
    }
    async function fetchBlogDetails1() {
        try {
            // Fetch blog from the database based on blog ID
            const response = await databases.listDocuments(DATABASE_ID, '677bcc1e00009ca0d635', [
                Query.equal('$id', blogId) // Replace with your query to get the blog
            ]);
            console.log(response.documents[0]);
    
            const blog = response.documents[0]; // Assuming blog is found
            if (blog) {
                // Populate form fields with existing data
                document.getElementById("edit-blog-title").value = blog.Title;
                document.getElementById("edit-blog-author").value = blog.Author;
                
                document.getElementById("edit-blog-excerpt").value = blog.Excerpt;
                document.getElementById("edit-blog-content").value = blog.content;
                console.log("we know its found")
    
                // Handle any additional data like images if necessary
                // For example, display current image URLs or leave the file inputs empty for new uploads
            } else {
                alert("Blog not found.");
            }
        } catch (error) {
            console.error("Error fetching blog details:", error);
        }
    }
    
    async function fetchProductDetails1() {
        try {
            // Fetch product from the database based on product ID
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.equal('$id', productId) // Replace with your query to get the product
            ]);
            console.log(response)
    
            const product = response.documents[0]; // Assuming product is found
            if (product) {
                // Populate form fields with existing data
                document.getElementById("edit-product-name").value = product.name;
                document.getElementById("edit-product-description").value = product.description;
                document.getElementById("edit-product-price").value = product.price;
                document.getElementById("edit-product-brand").value = product.brand;
                document.getElementById("edit-product-feature").checked = product.Feature;

                
                // You can also handle images (like showing the current image or uploading a new one)
                // For example, display current image URLs or leave the file inputs empty for new uploads
            } else {
                alert("Product not found.");
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    }
    const deleteProductButton1 = document.getElementById('delete-blog-btn');
    async function deleteProduct1(blogId) {
        try {
            // Perform the actual delete operation with Appwrite
            const response = await databases.deleteDocument(DATABASE_ID, "677bcc1e00009ca0d635", blogId);
            console.log('Product deleted:', response);
        } catch (error) {
            console.error('Error deleting product from database:', error);
            throw error; // Propagate error if deletion fails
        }
    }

    
    console.log(deleteProductButton1)
    if (deleteProductButton1){
        deleteProductButton1.addEventListener('click', async () => {
        
        
            // Confirm the deletion
            console.log("do we even see this")
            const confirmDelete = confirm("Are you sure you want to delete this blog?");
            
            if (confirmDelete) {
                try {
                    await deleteProduct1(blogId);
                    alert("Product deleted successfully.");
                    window.location.href = "blog.html"; // Redirect to the product listing page or other relevant page
                } catch (error) {
                    console.error("Error deleting product:", error);
                    alert("Failed to delete product. Please try again.");
                }
            }
        });
    }
    // Fetch product details from Appwrite
    async function fetchProductDetails() {
        try {
            if (!productId) {
                console.error('Product ID is missing from the URL');
                
            }
            const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID, productId);
            const product = response;

            // Update the product details section dynamically
            document.getElementById('product-name').innerText = product.name;
            document.getElementById('product-price').innerText = `£${parseFloat(product.price).toFixed(2)}`;

            document.getElementById('product-description').innerText = product.description || 'No description available.';
            // Fetch and update images
            const imageIds = [product.image_id, product.image_id1, product.image_id2, product.image_id3];
            const smallImages = document.getElementsByClassName('small-img');
            const mainImage = document.getElementById('MainImg');

            // Fetch and set main image (first image)
            if (imageIds[0]) {
                const mainImageResponse = await storage.getFileView(BUCKET_ID, imageIds[0]);
                mainImage.src = mainImageResponse.href;
            }

            // Update small images
            for (let i = 0; i < smallImages.length; i++) {
                if (imageIds[i]) {
                    const imageResponse = await storage.getFileView(BUCKET_ID, imageIds[i]);
                    smallImages[i].src = imageResponse.href;
                } else {
                    // Hide small images if there are no corresponding IDs
                    smallImages[i].style.display = 'none';
                }
            }
            
            // Add to cart functionality
            document.getElementById("add-to-cart").addEventListener("click", function() {
                const productName = product.name;
                const productPrice = product.price;
                const productDescription = product.description;
                const productSize = document.getElementById("product-size").value;
                const productQuantity = parseInt(document.getElementById("product-quantity").value);
                const productImg = mainImage.src;

                // Validate size selection
                if (productSize === "Select Size") {
                    alert("Please select a size.");
                    return;
                }

                // Create the product object
                const cartProduct = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    size: productSize,
                    quantity: productQuantity,
                    img: productImg,
                    description: productDescription
                };

                // Retrieve the cart from localStorage (or initialize it if it doesn't exist)
                let cart = JSON.parse(localStorage.getItem("cart")) || [];

                // Check if the product already exists in the cart
                const existingProductIndex = cart.findIndex(item => item.id === cartProduct.id && item.size === cartProduct.size);

                if (existingProductIndex > -1) {
                    // If the product exists, update its quantity
                    cart[existingProductIndex].quantity += cartProduct.quantity;
                } else {
                    // Otherwise, add the new product to the cart
                    cart.push(cartProduct);
                }

                // Save the updated cart to localStorage
                localStorage.setItem("cart", JSON.stringify(cart));

                // Optionally, alert the user
                alert(`${productName} has been added to the cart.`);
            });
            console.log("we got here")


    } catch (error) {
        console.error('Error fetching product details:', error);
    }

    console.log("this is where it goes wrong")
    const deleteProductButton = document.getElementById('delete-product-btn');


    // Function to delete a product from the database
    async function deleteProduct(productId) {
        try {
            // Perform the actual delete operation with Appwrite
            const response = await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, productId);
            console.log('Product deleted:', response);
        } catch (error) {
            console.error('Error deleting product from database:', error);
            throw error; // Propagate error if deletion fails
        }
    }
    
    if (deleteProductButton){
        deleteProductButton.addEventListener('click', async () => {
        
        
            // Confirm the deletion
            const confirmDelete = confirm("Are you sure you want to delete this product?");
            
            if (confirmDelete) {
                try {
                    await deleteProduct(productId);
                    alert("Product deleted successfully.");
                    window.location.href = "shop.html"; // Redirect to the product listing page or other relevant page
                } catch (error) {
                    console.error("Error deleting product:", error);
                    alert("Failed to delete product. Please try again.");
                }
            }
        });

    }
    console.log("deleteme")
    
    
    editProductForm.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        // Get the form values
        const updatedName = document.getElementById("edit-product-name").value;
        const updatedDescription = document.getElementById("edit-product-description").value;
        let updatedPrice = document.getElementById("edit-product-price").value;
        
        const updatedBrand = document.getElementById("edit-product-brand").value;
        const updatedFeature = document.getElementById("edit-product-feature").checked;
        console.log(typeof updatedPrice)
        updatedPrice = parseFloat(updatedPrice);
        console.log(typeof updatedPrice)
    
        const updatedProduct = {
            name: updatedName,
            description: updatedDescription,
            price: updatedPrice,
            brand: updatedBrand,
            Feature: updatedFeature,
            // Handle images here (you can upload new ones and get the image URLs/IDs)
            // Use the Appwrite storage to upload images and then update the product document
        };
    
        try {
            // Update the product in the database
            const response = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, productId, updatedProduct);
            console.log("Product updated successfully:", response);
            alert("Product updated successfully!");
            modal.style.display = "none"; // Close the modal
            fetchProductDetails();
            
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product. Please try again.");
        }
    });
    
    
    
    


    
}

// Function to display cart items on the cart page
document.addEventListener("DOMContentLoaded", function() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    let cartSubtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="7">Your cart is empty.</td></tr>';
    } else {
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            cartSubtotal += subtotal;

            cartItemsContainer.innerHTML += `
                <tr>
                    <td><a href="#" class="remove-item" data-id="${item.id}" data-size="${item.size}"><i class="far fa-times-circle"></i></a></td>
                    <td><img src="${item.img}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>£${item.price.toFixed(2)}</td>
                    <td>${item.size}</td>
                    <td><input type="number" value="${item.quantity}" data-id="${item.id}" data-size="${item.size}" class="quantity-input"></td>
                    <td>£${subtotal.toFixed(2)}</td>
                </tr>
            `;
        });

        // Update the cart totals
        document.getElementById("cart-subtotal").textContent = `£${cartSubtotal.toFixed(2)}`;
        document.getElementById("total-price").textContent = `£${cartSubtotal.toFixed(2)}`;
    }

    // Remove item from cart
    cartItemsContainer.addEventListener("click", function(e) {
        if (e.target.classList.contains("remove-item")) {
            const productId = e.target.getAttribute("data-id");
            const productSize = e.target.getAttribute("data-size");

            // Remove the item from the cart
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart = cart.filter(item => item.id !== productId || item.size !== productSize);

            // Save the updated cart
            localStorage.setItem("cart", JSON.stringify(cart));

            // Reload the page to update the cart view
            location.reload();
        }
    });

    // Update quantity
    cartItemsContainer.addEventListener("change", function(e) {
        if (e.target.classList.contains("quantity-input")) {
            const productId = e.target.getAttribute("data-id");
            const productSize = e.target.getAttribute("data-size");
            const newQuantity = parseInt(e.target.value);

            // Update the cart with the new quantity
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const productIndex = cart.findIndex(item => item.id === productId && item.size === productSize);

            if (productIndex > -1) {
                cart[productIndex].quantity = newQuantity;
                localStorage.setItem("cart", JSON.stringify(cart));
                location.reload();  // Reload the page to update the cart totals
                
            }
        }
    });
});



   
    
    
    
    // Call the fetchProductDetails function if on the product detail page
    if (productId) {
        console.log("Iamcollecting")
        if (!window.location.pathname.includes("blog-details.html")) {
            fetchProductDetails();
        }
    }
    async function updateFeaturedProducts() {
        try {
            // Fetch all products
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
            const products = response.documents;
    
            // Filter products with the 'Feature' property set to true
            const featuredProducts = products.filter(product => product.Feature === true);
    
            // Select the container for featured products
            const proContainer = document.querySelector('#product1 .pro-container');
    
            // Clear existing content
            proContainer.innerHTML = '';
    
            // Populate the container with featured products
            for (const product of featuredProducts) {
                // Create the product card
                const productCard = document.createElement('div');
                productCard.className = 'pro';
                productCard.onclick = () => window.location.href = `sproducts.html?id=${product.$id}`;
    
                // Fetch product image
                const imageId = product.feature_image_id || product.image_id;
                const imageResponse = imageId ? await storage.getFileView(BUCKET_ID, imageId) : null;
    
                // Set the inner HTML of the product card
                productCard.innerHTML = `
                    <img src="${imageResponse ? imageResponse.href : 'img/products/default.jpg'}" alt="${product.name}">
                    <div class="des">
                        <span>${product.brand || 'Unknown Brand'}</span>
                        <h5>${product.name}</h5>
                        <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <h4>£${product.price.toFixed(2)}</h4>
                    </div>
                    <a href="#"><i class="fal fa-shopping-cart cart"></i></a>
                `;
    
                // Append the product card to the container
                proContainer.appendChild(productCard);
            }
        } catch (error) {
            console.error('Error updating featured products:', error);
        }
    }
    
    // Call the function to update featured products on page load
    if (window.location.pathname.includes("index.html") || window.location.pathname.includes("sproducts.html")) {
        window.onload = updateFeaturedProducts;
    }
    
    
    async function updateNewArrivals() {
        try {
            // Fetch all products
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
            const products = response.documents;
    
            // Sort products by the 'datetime' attribute in descending order
            const sortedProducts = products.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
            // Select the 4 most recent products
            const newArrivals = sortedProducts.slice(0, 4);
    
            // Select the container for new arrivals
            const proContainer = document.querySelector('#product1 .pro-container1');
    
            // Clear existing content
            proContainer.innerHTML = '';
    
            // Populate the container with new arrivals
            for (const product of newArrivals) {
                // Create the product card
                const productCard = document.createElement('div');
                productCard.className = 'pro';
                productCard.onclick = () => window.location.href = `sproducts.html?id=${product.$id}`;
    
                // Fetch product image
                const imageId = product.feature_image_id || product.image_id;
                const imageResponse = imageId ? await storage.getFileView(BUCKET_ID, imageId) : null;
    
                // Set the inner HTML of the product card
                productCard.innerHTML = `
                    <img src="${imageResponse ? imageResponse.href : 'img/products/default.jpg'}" alt="${product.name}">
                    <div class="des">
                        <span>${product.brand || 'Unknown Brand'}</span>
                        <h5>${product.name}</h5>
                        <div class="star">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <h4>£${product.price.toFixed(2)}</h4>
                    </div>
                    <a href="#"><i class="fal fa-shopping-cart cart"></i></a>
                `;
    
                // Append the product card to the container
                proContainer.appendChild(productCard);
            }
        } catch (error) {
            console.error('Error updating new arrivals:', error);
        }
    }
    
    // Call the function to update new arrivals on page load
    if (window.location.pathname.includes("index.html")) {
        window.onload = updateNewArrivals;
        window.onload = updateFeaturedProducts;
    }
    

    if (window.location.pathname.includes("cart.html")) {
        
        
    
        document.getElementById('checkout').addEventListener('click', async () => {
            // Get email
            const email = document.getElementById('checkout-email').value;
            if (!email) {
                alert('Please provide an email address.');
                return;
            }
        
            // Collect cart items
            const cartItems = Array.from(document.querySelectorAll('#cart-items tr')).map((row) => {
                const cells = row.querySelectorAll('td');
                const quantityInput = cells[5]?.querySelector('input.quantity');
                console.log(cells[1])
                console.log(cells[2])
                console.log(cells[3])
                console.log(cells[4])
                console.log(cells[5])
                return {
                    product: cells[2]?.textContent.trim() || 'N/A',
                    price: parseFloat(cells[3]?.textContent.replace('£', '').trim() || '0'),
                    size: cells[4]?.textContent.trim() || 'N/A',
                    quantity: parseInt(quantityInput?.value || '0', 10), // Get value from the input
                };
            });
        
            if (cartItems.length === 0) {
                alert('Your cart is empty.');
                return;
            }
        
            // Convert cart items to string format for Appwrite
            const boughtArray = cartItems.map(item => 
                `${item.product}, Quantity: ${item.quantity}, Price: £${item.price.toFixed(2)}, Size: ${item.size}`
            );
        
            // Collect discount code if applied
            console.log(document.getElementById('coupon-name'))
            const discountCode = document.getElementById('coupon-name').textContent.trim() || '';

            console.log(discountCode)
            // Calculate the total
            
            const totalPriceElement = document.getElementById("cart-total");
            const totalPrice = parseFloat(totalPriceElement.textContent.replace('£', '').trim());
            console.log(totalPrice)

        
            // Construct the document data
            const data = {
                email: email,
                price: totalPrice,
                discountcode: discountCode,
                bought: boughtArray, // Array of strings
                completed: false,
            };
        
            try {
                // Upload the data to Appwrite
                const response = await databases.createDocument(
                    DATABASE_ID,
                    '677e685300159239b0d2', // Replace with your Appwrite collection ID
                    'unique()', // Unique document ID
                    data
                );
                console.log('Checkout successful:', response);
                localStorage.removeItem('appliedCoupon');
                localStorage.removeItem('cart');
                location.reload();
                alert('Checkout complete! We will contact you shortly.');
            } catch (error) {
                console.error('Error during checkout:', error);
                alert('An error occurred during checkout. Please try again.');
            }
        });
    }
    let showCurrentOrders = true;
    async function fetchOrders() {
        
        try {
          // Change the query based on whether we are showing current orders or all orders
          const query = showCurrentOrders ? 
            [Query.equal('completed', false)] : [];  // If showing current orders, filter by completed = false, otherwise fetch all
      
          const response = await databases.listDocuments(DATABASE_ID, '677e685300159239b0d2', query);
          const orders = response.documents;
          const ordersContainer = document.getElementById('current-orders');
          ordersContainer.innerHTML = ""; // Clear existing content
      
          // Loop through the orders and display them
          orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.classList.add('order-item');
            console.log(order.$createdAt)
            const createdDate = formatDate1(order.$createdAt);
            const discount = order.discountCode || "None Applied";
            const formattedProducts = order.bought.map(product => {
                // Split product string into name, quantity, price, and size
                const [name, quantity, price, size] = product.split(',').map(part => part.trim());
                
                // Bold the product name and return a formatted string
                return `<div class="productnew">
                    <p><strong>${name.split(':')[0]}</strong>, ${quantity}, ${price}, ${size}</p>
                    </div>` 
                ;
            }).join('');  // Join all products into a single string

            
            // Display order details
            orderElement.innerHTML = `
              <p><strong> ${createdDate}</strong></p>
              <p><strong>Email: </strong>${order.email}</p>
              <p><strong>Products:</strong> ${formattedProducts}</p>
              <p><strong>Discount:</strong> ${discount}</p>
              <p><strong>Price: </strong>£${order.price}</p>
              
            `;
            if (!order.completed) {
                // Show "Mark as Completed" if the order is not yet completed
                orderElement.innerHTML += `<button class="mark-completed" data-order-id="${order.$id}">Mark as Completed</button>`;
            } else {
                // Show "Mark as Uncompleted" if the order is completed
                orderElement.innerHTML += `<button class="mark-uncompleted" data-order-id="${order.$id}">Mark as Uncompleted</button>`;
            }
            ordersContainer.appendChild(orderElement);
          });
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
      
      // Function to toggle between current and all orders
      function toggleOrderView() {
        showCurrentOrders = !showCurrentOrders;  // Toggle the flag
        document.getElementById('toggle-orders').textContent = showCurrentOrders ? 'Show All Orders' : 'Show Current Orders';  // Change button text
        fetchOrders();  // Refresh the order list
      }
      
      // Event listener for the "Show All Orders" button
      
      
      
    if (window.location.pathname.includes("administration.html")) {
        window.onload = fetchOrders;
        document.getElementById('toggle-orders').addEventListener('click', toggleOrderView);
        
    }
    
      
      // Function to update the order status
    async function updateOrderStatus(orderId, completedStatus) {
        try {
          const updatedOrder = {
            completed: completedStatus,
          };
      
          // Update the document in Appwrite database
          await databases.updateDocument(DATABASE_ID, '677e685300159239b0d2', orderId, updatedOrder);
          alert(`Order status updated to ${completedStatus ? 'Completed' : 'Uncompleted'}.`);
      
          // Refresh the orders after update
          fetchOrders();
        } catch (error) {
          console.error('Error updating order status:', error);
          alert('Failed to update order status.');
        }
    }
    if (window.location.pathname.includes("administration.html")) {
        
        
    
        document.addEventListener('click', async (e) => {
            if (e.target && e.target.classList.contains('mark-completed')) {
              const orderId = e.target.getAttribute('data-order-id');
              await updateOrderStatus(orderId, true);  // Mark as completed
            }
          
            if (e.target && e.target.classList.contains('mark-uncompleted')) {
              const orderId = e.target.getAttribute('data-order-id');
              await updateOrderStatus(orderId, false);  // Mark as uncompleted
            }
          });
    }
    
    

    
    
    
    
    
});





