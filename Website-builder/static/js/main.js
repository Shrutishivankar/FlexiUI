document.addEventListener("DOMContentLoaded", function () {
  // Get canvas and buttons once at the start
  const canvas = document.getElementById('canvas');
  const clearBtn = document.getElementById('action_clear');
  const previewBtn = document.getElementById('action_preview');
  const downloadBtn = document.getElementById('action_download');
  const deployBtn = document.getElementById('action_deploy');
  const saveBtn = document.getElementById('action_save');
  const backBtn = document.getElementById('action_back');

  // Simulated authentication check
  // const isLoggedIn = true; // Change to false to test behavior when user is not logged in

  // Show user feedback (toast notification)
  function showToast(message, type = "success") {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast', 'toast-' + type);
    toastContainer.textContent = message;
    document.body.appendChild(toastContainer);

    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
      toastContainer.remove();
    }, 3000);
  }
  
  // Clear the canvas
  clearBtn.addEventListener('click', function () {
    // Show a confirmation dialog box
    const isConfirmed = window.confirm('Are you sure you want to clear the data?');

    if (isConfirmed) {
        // If the user clicks "OK", clear the canvas
        while (canvas.firstChild) {
            canvas.removeChild(canvas.firstChild);
        }
        // Handle user feedback (you can log, show a message, etc.)
        console.log('Canvas cleared!');
    } else {
        // If the user clicks "Cancel", do nothing
        console.log('Canvas clear action cancelled.');
    }
  });
previewBtn.addEventListener("click", function () {
  // Get the generated content from the canvas
  let canvasContent = canvas.innerHTML;

  // Open a new window for preview
  let previewWindow = window.open("", "Preview Window", "width=800,height=600");

  // Write the content into the new window
  previewWindow.document.write(`
    <html>
    <head>
      <title>Preview</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .preview-header { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8f9fa; border-bottom: 1px solid #ddd; }
        .preview-content { 
          border: 1px solid #ccc; 
          padding: 10px; 
          margin-top: 10px; 
          overflow: auto; 
          min-height: 400px;
          position: relative;
        }
        .device-buttons button { margin-right: 5px; }
      </style>
    </head>
    <body>
      <div class="preview-header">
        <h5>Preview</h5>
        <div class="device-buttons">
          <button class="btn btn-sm btn-outline-primary" onclick="document.getElementById('previewContent').style.width='100%'; document.getElementById('previewContent').style.height='100%';">Desktop</button>
          <button class="btn btn-sm btn-outline-primary" onclick="document.getElementById('previewContent').style.width='768px'; document.getElementById('previewContent').style.height='1024px';">Tablet</button>
          <button class="btn btn-sm btn-outline-primary" onclick="document.getElementById('previewContent').style.width='375px'; document.getElementById('previewContent').style.height='667px';">Mobile</button>
          <button class="btn btn-sm btn-outline-danger" onclick="window.close();">Close</button>
        </div>
      </div>
      <div id="previewContent" class="preview-content">${canvasContent}</div>
    </body>
    </html>
  `);

  // Wait for the preview window to load, then apply the canvas size and styles
  previewWindow.document.close();

  // Ensure the preview content matches the canvas size
  let canvasStyles = getComputedStyle(canvas); // Get the styles of the original canvas

  // Apply the canvas styles to the preview content
  let previewContent = previewWindow.document.getElementById('previewContent');
  previewContent.style.width = canvasStyles.width;
  previewContent.style.height = canvasStyles.height;
  previewContent.style.position = 'relative'; // If you have absolutely positioned elements on the canvas
});


   // Download functionality
   downloadBtn.addEventListener("click", function () {
    // if (!isLoggedIn) {
    //   alert("You must be logged in to download the file.");
    //   return;
    // }
    
    const isConfirmed = window.confirm("Your download is starting. Do you want to continue?");
    if (!isConfirmed) {
      return;
    }
    
    const canvasContent = `<!DOCTYPE html>
    <html>
    <head>
      <title>Downloaded Page</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; padding: 20px; }
        .container { border: 1px solid #ccc; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        ${canvas.innerHTML}
      </div>
    </body>
    </html>`;
    try {
    const blob = new Blob([canvasContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "canvas.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast("Download completed! File saved as HTML.");
    } catch (error) {
      console.error("Error while downloading:", error);
      showToast("An error occurred during the download.", "error");
    }
  });

  // Deploy Functionality
  deployBtn.addEventListener('click', function() {
    // 1. Gather the dynamic components' data (HTML + properties)
    const componentsData = getDynamicComponentsData();

    // 2. Example action: send the gathered data to the backend for deployment
    deployContent(componentsData);

    // 3. Provide feedback to the user
    alert('Your design has been deployed!');
  });

  function getDynamicComponentsData() {
    // Collect data for each component dynamically (you may need to loop over them)
    const components = document.querySelectorAll('.dynamic-component'); // Assuming each dynamic component has this class

    const componentsData = Array.from(components).map(component => {
      return {
        id: component.id,
        type: component.dataset.type, // Example: storing the type (e.g., 'navbar', 'card')
        html: component.innerHTML,    // HTML content of the component
        styles: getComputedStyle(component).cssText, // Style properties
        properties: {
          text: component.textContent,  // Store relevant properties
          backgroundColor: component.style.backgroundColor,
          color: component.style.color,
          fontSize: component.style.fontSize,
          // Add more properties if needed
        }
      };
    });

    return componentsData;
  }

  function deployContent(data) {
    // Example: Send the content to the backend for deployment
    fetch('/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ components: data }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log success or failure response
    })
    .catch(error => {
      console.error('Error deploying content:', error);
    });
  }
 
  // Saving Functionality
  saveBtn.addEventListener('click', function () {
    let choice = prompt("How would you like to save this canvas?\nType 'pdf' to save as PDF or 'image' to save as image.");
  
    if (!choice) {
      showToast("Save cancelled by user.", "warning");
      return;
    }
  
    choice = choice.trim().toLowerCase();
    const canvasElement = document.querySelector('#canvas');
  
    if (!canvasElement) {
      showToast("Canvas element not found!", "error");
      return;
    }
  
    // 1. Expand all collapses before capture
    const collapses = document.querySelectorAll('.collapse');
    collapses.forEach(c => c.classList.add('show'));
  
    // 2. Wait for the browser to render everything correctly before capturing
    setTimeout(() => {
      // Check if canvas is visible
      const isVisible = canvasElement.offsetWidth > 0 && canvasElement.offsetHeight > 0;
      
      if (!isVisible) {
        showToast("Canvas element is not visible. Please check your layout.", "error");
        return;
      }
  
      // 3. Capture the content as PDF or Image
      if (choice === "pdf") {
        html2canvas(canvasElement, {
          useCORS: true, // Ensures images from external sources are also captured
        }).then(function (canvas) {
          const imgData = canvas.toDataURL('image/png');
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
  
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
  
          let imgWidth = pageWidth;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;
  
          if (imgHeight > pageHeight) {
            imgHeight = pageHeight;
            imgWidth = (canvas.width * imgHeight) / canvas.height;
          }
  
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;
  
          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
          pdf.save('canvas_snapshot.pdf');
          showToast("Canvas saved as PDF!");
        }).catch(error => {
          console.error("PDF Save Error:", error);
          showToast("An error occurred while saving as PDF.", "error");
        });
  
      } else if (choice === "image") {
        html2canvas(canvasElement, {
          useCORS: true,
        }).then(function (canvas) {
          const imageData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imageData;
          link.download = 'canvas_snapshot.png';
          link.click();
          showToast("Canvas saved as image!");
        }).catch(error => {
          console.error("Image Save Error:", error);
          showToast("An error occurred while saving as image.", "error");
        });
  
      } else {
        showToast("Invalid input! Please type 'pdf' or 'image'.", "error");
      }
  
      // 4. Collapse components back after saving
      collapses.forEach(c => c.classList.remove('show'));
  
    }, 500); // Adjust timeout based on content complexity
  });  

  // Back button
  backBtn.addEventListener('click', function () {
    window.history.back();
  });

  // Show user feedback (toast)
  function showToast(message, type = "success") {
    const toastContainer = document.createElement('div');
    toastContainer.classList.add('toast', 'toast-' + type);
    toastContainer.textContent = message;
    document.body.appendChild(toastContainer);

    setTimeout(() => {
      toastContainer.remove();
    }, 3000);
  }

  // Drag-and-Drop functionality
  // Allow components in the sidebar to be draggable
  const draggableComponents = document.querySelectorAll('.list');
  draggableComponents.forEach(component => {
    component.addEventListener('dragstart', function (e) {
      draggedItem = e.target;  // Store the item being dragged
      draggedItem.classList.add('dragging'); // Optional: for styling during drag
    });

    component.addEventListener('dragend', function () {
      setTimeout(() => {
       //  draggedItem.classList.remove('dragging');  // Remove the dragging style
        draggedItem = null;  // Reset draggedItem after drag ends
      }, 0);
    });
  });

  // Allow dropping components onto the canvas
  canvas.addEventListener('dragover', function (e) {
    e.preventDefault();  // Allow the drop
  });

  canvas.addEventListener('drop', function (e) {
    e.preventDefault();

    if (draggedItem) {
      // Directly append the dragged item to the canvas without cloning
      canvas.appendChild(draggedItem);

      // Add event listeners to make the newly dropped component reorderable
      addReorderingListeners(draggedItem);
    }
  });

  // Function to add reordering functionality to a component
  function addReorderingListeners(component) {
    component.addEventListener('dragstart', function (e) {
      draggedItem = e.target;  // Track the dragged item within the canvas
      draggedItem.classList.add('dragging');  // Optional: for styling during drag
    });

    component.addEventListener('dragend', function () {
      draggedItem.classList.remove('dragging');  // Remove dragging style after drag ends
      draggedItem = null;  // Reset after drag ends
    });

    // Enable reordering within the canvas
    canvas.addEventListener('dragover', function (e) {
      e.preventDefault();  // Allow the drop

      const target = e.target;
      if (target !== draggedItem && target.classList.contains('list')) {
        target.style.border = '2px dashed #000';  // Highlight target component during dragover
      }
    });

    canvas.addEventListener('dragleave', function (e) {
      const target = e.target;
      if (target.classList.contains('list')) {
        target.style.border = '';  // Remove the highlight when dragged item leaves the target
      }
    });

    canvas.addEventListener('drop', function (e) {
      e.preventDefault();

      const target = e.target;
      if (target.classList.contains('list') && target !== draggedItem) {
        const parent = target.parentNode;
        parent.insertBefore(draggedItem, target);  // Reorder the dragged item within the canvas
        target.style.border = '';  // Remove the border highlight
      }
    });
  }
});