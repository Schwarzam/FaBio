import React, { useEffect, useRef, useState } from 'react';
import { AuroraBackground } from './ui/aurora';
import { motion } from 'framer-motion';
import { post } from './helpers/helpers';
import { LabelInputContainer } from './helpers/elements';
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

export default function Register() {
    const videoRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 360, height: 360 });

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [something, setSomething] = useState('');

    const [showVideo, setShowVideo] = useState(false);
    const [captureFrameInterval, setCaptureFrameInterval] = useState(null);
     
    const [regToken, setRegToken] = useState(null);

    const [imageBlob1, setImageBlob1] = useState(null)
    const [videoHidden, setVideoHidden] = useState(true)

    const navigate = useNavigate();

    const steps = ['straight', 'left', 'right', 'take'];
    const steps_messages = [
      'Please look straight and center your face.', 
      'Please look to the right.', 
      'Please look to the left.', 
      'Please look straight and center your face.',
      'You completed all steps!'
    ];
    const [currentStep, setCurrentStep] = useState(0);
    const currentStepRef = useRef(currentStep);

    const ledStates = [
        'bg-yellow-500',
        'bg-green-500',
        'bg-red-500'
    ]
    const [ledState, setLedState] = useState(0);
    useEffect(() => {
        async function setupVideo() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing video stream:', err);
            }
        }

        setupVideo();

        function updateCanvasSize() {
            const maxWidth = window.innerWidth > 360 ? 360 : window.innerWidth - 20;
            const maxHeight = window.innerHeight > 360 ? 360 : window.innerHeight - 20;
            setCanvasSize({ width: maxWidth, height: maxHeight });
        }

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        toast("Fill the fields to register", { type: 'info' })

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    const captureImageBlob = async () => {
        if (imageBlob1) {return};

        const canvas = document.createElement('canvas');
        const videoElement = videoRef.current;
        const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;

        canvas.width = 1024;
        canvas.height = 1024 / aspectRatio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        console.log("Capturing blob1")
        canvas.toBlob(blob => 
            setImageBlob1(
                blob
            ))
    }

    const register = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');

        const videoElement = videoRef.current;
        const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;

        canvas.width = 1024;
        canvas.height = 1024 / aspectRatio;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const buffer2 = await imageBlob1.arrayBuffer();

        setLedState(1);
        canvas.toBlob(blob => {
            if (blob) {
                blob.arrayBuffer().then(buffer => {
                    const formData = new FormData();
                    formData.append('imageUpload', new Blob([buffer], { type: 'image/png' }), 'image.png');
                    formData.append('imageUpload2', new Blob([buffer2], { type: 'image/png' }), 'image2.png')
                    formData.append('email', email);
                    formData.append('first_name', firstName);
                    formData.append('last_name', lastName);
                    formData.append('something', something);
                    formData.append('token', regToken);

                    post('/api/register/', formData)
                        .then(data => {
                            if (data['error']) {
                                toast.error(data['error']);
                                if (data['redo']){
                                    const stepIndex = steps.indexOf(data['redo']);
                                    setCurrentStep(stepIndex);
                                    startCaptureInterval(2000);
                                }
                            }

                            toast.success(data['message']);
                            data['message'] === 'User created successfully' ? navigate('/login') : console.log(data['message'])
                            
                        })
                        .catch(error => {
                            toast.error(error);
                            setLedState(2);
                            console.log(error)
                        });
                });
            }
        }, 'image/jpeg');
    };

    const startCaptureInterval = () => {
        setCaptureFrameInterval(setInterval(captureFrame, 1000));
    }

    const stopCaptureInterval = () => {
        clearInterval(captureFrameInterval);
        setCaptureFrameInterval(null);
    }

    const handleInputChange = (e, setInput) => {
        setInput(e.target.value);
        setCurrentStep(0);

        if (firstName && lastName && email && something) {
            if (captureFrameInterval === null){
                startCaptureInterval();
            }
            setVideoHidden(false)
        }
    }; 

    useEffect(() => {
        currentStepRef.current = currentStep; // Keep ref up to date
        setGreen();

        if (currentStep === steps.length) {
            stopCaptureInterval();
            register();
        }
        
    }, [currentStep]);

    // I want to set a interval that will set the ledState to 1 for 1 second and then back to 0
    const setGreen = () => {
        setLedState(1);
        setTimeout(() => {
            setLedState(0);
        }, 2000);
    }

    const captureFrame = async () => {
        if (!videoRef.current) return;
    
        const canvas = document.createElement('canvas');
        const videoElement = videoRef.current;
        const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.width / aspectRatio;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            if (blob) {
                blob.arrayBuffer().then(buffer => {
                    var formData = new FormData();
                    formData.append('imageUpload', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
                    formData.append('email', email);

                    const direction = steps[currentStepRef.current]
                    formData.append('direction', steps[currentStepRef.current]);
                    
                    post('/api/test_side_face/', formData)
                        .then(response => {
                            // Move to the next step based on current direction
                            if (steps[currentStepRef.current] === 'take' && response['correct']) {
                                setRegToken(response['token']);
                            }

                            if (response['correct']) {
                                if (direction === "straight"){
                                    captureImageBlob();
                                }

                                const nextStep = currentStepRef.current + 1;
                                setCurrentStep(nextStep);

                                
                            }

                        })
                        .catch(error => {
                            console.error(error);
                        });
                });
            }
        }, 'image/jpeg');
    };
    return (
      <div>
          <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeInOut",
              }}
              className="relative flex flex-col gap-4 items-center justify-center px-4 bg-gray-100 dark:bg-[#201c1c]"
          >
            <div className='pt-12'>
                <button onClick={() => navigate("/")} className='dark:text-white border p-4 rounded-xl'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </button>
            </div>
              <div className="max-w-md my-10 rounded-lg w-full md:rounded-2xl p-4 md:p-8 shadow-input text-black dark:text-white dark:bg-[#201c1c]">
                <p className='pb-8 font-bold text-lg'>Register yourself, keep a secret safe</p>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                    <LabelInputContainer>
                        <Label htmlFor="firstname">First name</Label>
                        <Input id="firstname" placeholder="Vincas" type="text" onChange={(e) => handleInputChange(e, setFirstName)} />
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="lastname">Last name</Label>
                        <Input id="lastname" placeholder="Oliveira" type="text" onChange={(e) => handleInputChange(e, setLastName)} />
                    </LabelInputContainer>
                    </div>
                  <LabelInputContainer className="mb-4">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" placeholder="projectmayhem@mack.com" type="email" onChange={(e) => handleInputChange(e, setEmail)} />
                  </LabelInputContainer>

                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="something">Tell me a secret of yours</Label>
                        <Input id="something" placeholder="Corinthians" type="something" onChange={(e) => handleInputChange(e, setSomething)} />
                    </LabelInputContainer>
                    
                    <div className={`relative md:min-h-[1000px] mt-4 ${videoHidden ? 'hidden' : ''}`}>
                        <p className={`bg-gray-300 text-center p-4 border rounded-2xl mt-10 text-black dark:text-black border-neutral-200 dark:border-gray-200`}>
                            {steps_messages[currentStep]}
                        </p>
                        <div className={`${ledStates[ledState]} p-2 absolute rounded-[500px]`}>
                            <video style={{"transform": "scaleX(-1)"}} className='rounded-[500px]' ref={videoRef} preload={true} autoPlay playsInline muted />
                        </div>
                    </div>
                  
              </div>
          </motion.div>
        </div>
  );
}