import React, { useEffect, useRef, useState } from 'react';
import { AuroraBackground } from './ui/aurora';
import { motion } from 'framer-motion';
import { post } from './helpers/helpers';
import { LabelInputContainer } from './helpers/elements';
import { Label } from "./ui/label";
import { Input } from "./ui/input";

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

    const steps = ['straight', 'left', 'right', 'take'];
    const steps_messages = [
      'Please look straight and center your face.', 
      'Please look to the left.', 
      'Please look to the right.', 
      'Please look straight and center your face.',
      'You completed all steps!'
    ];
    const [currentStep, setCurrentStep] = useState(0);
    const currentStepRef = useRef(currentStep);

    const ledStates = [
        'bg-yellow-500',
        'bg-green-500',
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

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    const handleShowVideoButton = () => {
        setShowVideo(true);
    };

    const register = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            if (blob) {
                blob.arrayBuffer().then(buffer => {
                    console.log(localStorage.getItem('regtoken'))
                    var formData = new FormData();
                    formData.append('imageUpload', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
                    formData.append('email', email);
                    formData.append('first_name', firstName);
                    formData.append('last_name', lastName);
                    formData.append('something', something);
                    formData.append('token', regToken);

                    post('/api/register/', formData)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(error => {
                            console.error(error);
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
    
        if (firstName && lastName && email) {
            if (captureFrameInterval === null){
                startCaptureInterval();
            }
            
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
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            if (blob) {
                blob.arrayBuffer().then(buffer => {
                    var formData = new FormData();
                    formData.append('imageUpload', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
                    formData.append('email', email);
                    formData.append('direction', steps[currentStepRef.current]);
                    
                    post('/api/test_side_face/', formData)
                        .then(response => {
                            // Move to the next step based on current direction
                            if (steps[currentStepRef.current] === 'take' && response['correct']) {
                                setRegToken(response['token']);
                            }

                            if (response['correct']) {
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
              className="relative flex flex-col gap-4 items-center justify-center px-4 bg-gray-100 dark:bg-gray-900"
          >
              <div className="max-w-md my-10 rounded-lg w-full md:rounded-2xl p-4 md:p-8 shadow-input text-black dark:text-white bg-white dark:bg-black">
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
                        <Label htmlFor="something">Something about you</Label>
                        <Input id="something" placeholder="Corinthians" type="something" onChange={(e) => handleInputChange(e, setSomething)} />
                    </LabelInputContainer>
                    <p className={`bg-gray-300 text-center p-4 border rounded-2xl mt-10 text-black dark:text-white border-neutral-200 dark:border-slate-800`}>
                        {steps_messages[currentStep]}
                    </p>
                    
                    <div className='relative min-h-screen'>
                        <div className={`${ledStates[ledState]} p-2 absolute rounded-2xl`}>
                            <video className='rounded-2xl' ref={videoRef} preload={true} autoPlay playsInline muted />
                        </div>
                    </div>
                  
              </div>
          </motion.div>
        </div>
  );
}