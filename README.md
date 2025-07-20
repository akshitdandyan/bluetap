# 🔵 BlueTap

**Real-time Device Connection Hub with QR Code Scanning**

A modern, beautiful web application that enables seamless device-to-device connections through QR code scanning and real-time socket communication.

![BlueTap Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-orange)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-red)

## ✨ Features

### 🎯 **Core Functionality**

- **Real-time Device Connection**: Instant device-to-device communication
- **QR Code Generation**: Automatic QR code generation for device pairing
- **QR Code Scanning**: Beautiful camera-based QR code scanner
- **Device Detection**: Automatic device brand, model, and OS detection
- **IP Address Tracking**: Real-time IP address monitoring
- **Connection Status**: Live connection status indicators

### 🎨 **Beautiful UI/UX**

- **Modern Design**: Clean, minimalist interface with gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop and mobile devices
- **Smooth Animations**: Elegant transitions and loading states
- **Real-time Updates**: Live status indicators and connection feedback
- **Dark/Light Theme**: Beautiful color schemes throughout

### 🔧 **Technical Features**

- **Socket.IO Integration**: Real-time bidirectional communication
- **Camera API**: Native browser camera access for QR scanning
- **Device Detection**: Automatic device information extraction
- **Error Handling**: Graceful error handling and user feedback
- **Cross-platform**: Works on all modern browsers and devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or bun package manager
- Modern web browser with camera access

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/akshitdandyan/BlueTap.git
   cd BlueTap
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   ```bash
   # In backend directory, create .env file
   echo "PORT=3001" > .env
   ```

4. **Start the application**

   ```bash
   # Start backend server
   cd backend
   npm start

   # In another terminal, start frontend
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3001`

## 📱 Usage

### Device Connection Flow

1. **Open BlueTap** in your browser
2. **Allow camera access** when prompted
3. **View your device info**:
   - IP Address
   - Device brand/model/OS
   - Connection status
4. **Scan QR Code** to connect to another device
5. **Share your QR code** for others to scan

### QR Code Scanning

1. **Click "Scan QR Code"** button
2. **Allow camera permission** when prompted
3. **Position QR code** within the scanning frame
4. **Wait for detection** - the app will automatically detect QR codes
5. **View connection details** once detected

## 🏗️ Architecture

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/
│   │   └── QRScanner.jsx      # QR code scanner component
│   ├── pages/
│   │   └── Home.jsx           # Main application page
│   ├── utils/
│   │   ├── axios.js           # HTTP client configuration
│   │   └── getIpAddress.js    # IP address detection
│   └── App.jsx                # Main app component
├── package.json
└── vite.config.js
```

### Backend (`/backend`)

```
backend/
├── core/
│   ├── deviceMesh.ts          # Device management system
│   └── socketTower.ts         # Socket.IO server setup
├── helpers/
│   └── getUniqueRandomId.ts   # Unique ID generation
├── types/
│   └── device.types.ts        # TypeScript type definitions
├── routes/                    # API routes
└── index.ts                   # Server entry point
```

## 🛠️ Technology Stack

### Frontend

- **React 19.1.0** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **jsQR** - QR code detection library
- **Device Detector** - Device information extraction

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **TypeScript** - Type-safe JavaScript
- **QR Code Generation** - Server-side QR code creation
- **Unique Username Generator** - Device identification

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```env
PORT=3001
NODE_ENV=development
```

**Frontend (.env)**

```env
VITE_SERVER_URL=http://localhost:3001
```

### Camera Permissions

The application requires camera access for QR code scanning. Make sure to:

- Allow camera permissions when prompted
- Use HTTPS in production (required for camera access)
- Test on devices with cameras

## 🎨 UI Components

### Main Dashboard

- **Connection Status Indicator**: Real-time connection status
- **Device Information Cards**: IP address and device details
- **QR Code Display**: Generated QR code for device pairing
- **Scan Button**: Opens QR code scanner

### QR Scanner Modal

- **Camera Feed**: Live video stream
- **Scanning Overlay**: Visual guide for QR positioning
- **Status Indicators**: Scanning progress and feedback
- **Error Handling**: Graceful permission and error states

## 🔒 Security Features

- **HTTPS Required**: Camera access requires secure connection
- **Permission Handling**: Proper camera permission management
- **Error Boundaries**: Graceful error handling
- **Input Validation**: Server-side validation for all inputs

## 🚀 Deployment

### Production Build

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy backend**

   ```bash
   cd backend
   npm run build
   npm start
   ```

3. **Environment setup**
   - Set `NODE_ENV=production`
   - Configure `VITE_SERVER_URL` for your domain
   - Ensure HTTPS is enabled

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.IO** for real-time communication
- **jsQR** for QR code detection
- **Tailwind CSS** for beautiful styling
- **React** for the amazing frontend framework

## 📞 Support

If you have any questions or need help:

- **Create an issue** on GitHub
- **Email**: support@bluetap.dev
- **Documentation**: [docs.bluetap.dev](https://docs.bluetap.dev)

---

<div align="center">
  <p>Made with ❤️ by the Akshit Dandyan</p>
  <p>
    <a href="https://github.com/akshitdandyan/BlueTap">GitHub</a> •
    <a href="https://bluetap.dev">Website</a> •
    <a href="https://docs.bluetap.dev">Documentation</a>
  </p>
</div>
