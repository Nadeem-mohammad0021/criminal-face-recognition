// DOM Elements
const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const startButton = document.getElementById("startCamera")
const stopButton = document.getElementById("stopCamera")
const captureButton = document.getElementById("captureImage")
const resultsContainer = document.getElementById("resultsContainer")
const databaseContainer = document.getElementById("databaseContainer")
const imageUpload = document.getElementById("imageUpload")
const personName = document.getElementById("personName")
const personStatus = document.getElementById("personStatus")
const addToDBButton = document.getElementById("addToDB")
const alarmSound = document.getElementById("alarmSound")

// Global variables
let stream
let faceDetector
const database = []
let isDetecting = false

// Check if FaceDetector is supported
if ("FaceDetector" in window) {
  faceDetector = new FaceDetector()
} else {
  console.error("FaceDetector is not supported in this browser")
  alert("Face detection is not supported in this browser. Some features may not work.")
}

// Start camera
startButton.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    video.srcObject = stream
    startButton.disabled = true
    stopButton.disabled = false
    captureButton.disabled = false
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      if (!isDetecting) {
        isDetecting = true
        detectFaces()
      }
    }
  } catch (err) {
    console.error("Error accessing the camera:", err)
  }
})

// Stop camera
stopButton.addEventListener("click", () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    video.srcObject = null
    startButton.disabled = false
    stopButton.disabled = true
    captureButton.disabled = true
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    isDetecting = false
  }
})

// Capture image
captureButton.addEventListener("click", () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  processImage(canvas)
})

// Add to database
addToDBButton.addEventListener("click", () => {
  const file = imageUpload.files[0]
  if (file && personName.value) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0, img.width, img.height)
        processImage(canvas, true)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    alert("Please select an image and enter a name")
  }
})

// Process image
async function processImage(imageSource, addToDatabase = false) {
  if (!faceDetector) return

  try {
    const faces = await faceDetector.detect(imageSource)
    if (faces.length > 0) {
      faces.forEach((face) => {
        const { top, left, width, height } = face.boundingBox
        ctx.strokeStyle = "red"
        ctx.lineWidth = 2
        ctx.strokeRect(left, top, width, height)

        if (addToDatabase) {
          const faceImage = canvas.toDataURL("image/jpeg")
          database.push({
            name: personName.value,
            status: personStatus.value,
            image: faceImage,
          })
          updateDatabaseDisplay()
          personName.value = ""
          imageUpload.value = ""
        } else {
          const matchedPerson = findMatch(face)
          if (matchedPerson) {
            displayResult(matchedPerson)
            if (matchedPerson.status === "criminal") {
              playAlarm()
            }
          }
        }
      })
    } else {
      console.log("No faces detected")
    }
  } catch (err) {
    console.error("Error in face detection:", err)
  }
}

// Continuous face detection
async function detectFaces() {
  if (!faceDetector || !stream || !isDetecting) return

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  try {
    const faces = await faceDetector.detect(canvas)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    faces.forEach((face) => {
      const { top, left, width, height } = face.boundingBox
      ctx.strokeStyle = "red"
      ctx.lineWidth = 2
      ctx.strokeRect(left, top, width, height)

      const matchedPerson = findMatch(face)
      if (matchedPerson) {
        ctx.fillStyle = matchedPerson.status === "criminal" ? "red" : "green"
        ctx.fillText(matchedPerson.name, left, top - 5)
      }
    })
  } catch (err) {
    console.error("Error in face detection:", err)
  }

  if (isDetecting) {
    requestAnimationFrame(detectFaces)
  }
}

// Find match in database (simplified)
function findMatch(face) {
  // In a real system, this would use facial recognition algorithms
  // Here, we're just randomly matching for demonstration purposes
  if (Math.random() < 0.3 && database.length > 0) {
    return database[Math.floor(Math.random() * database.length)]
  }
  return null
}

// Display result
function displayResult(person) {
  const resultCard = document.createElement("div")
  resultCard.className = `face-card ${person.status}`
  resultCard.innerHTML = `
        <img src="${person.image}" alt="${person.name}">
        <p>${person.name}</p>
        <p>Status: ${person.status}</p>
    `
  resultsContainer.appendChild(resultCard)
}

// Update database display
function updateDatabaseDisplay() {
  databaseContainer.innerHTML = ""
  database.forEach((person) => {
    const personCard = document.createElement("div")
    personCard.className = `face-card ${person.status}`
    personCard.innerHTML = `
            <img src="${person.image}" alt="${person.name}">
            <p>${person.name}</p>
            <p>Status: ${person.status}</p>
        `
    databaseContainer.appendChild(personCard)
  })
}

// Play alarm
function playAlarm() {
  alarmSound.play().catch((err) => console.error("Error playing alarm:", err))
}

// Initialize
updateDatabaseDisplay()

