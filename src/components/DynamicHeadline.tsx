'use client';

import { useState, useEffect } from 'react';

const words = ['Pizzería', 'Hamburguesería', 'Heladería', 'Cafetería', 'Restaurante', 'Negocio'];

export default function DynamicHeadline() {
    const [index, setIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Speed settings
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    useEffect(() => {
        const currentWord = words[index];

        const handleTyping = () => {
            if (!isDeleting) {
                // Typing
                if (displayText.length < currentWord.length) {
                    setDisplayText(currentWord.slice(0, displayText.length + 1));
                } else {
                    // Finished typing word, pause then delete
                    setTimeout(() => setIsDeleting(true), pauseTime);
                    return;
                }
            } else {
                // Deleting
                if (displayText.length > 0) {
                    setDisplayText(currentWord.slice(0, displayText.length - 1));
                } else {
                    // Finished deleting, move to next word
                    setIsDeleting(false);
                    setIndex((prev) => (prev + 1) % words.length);
                    return;
                }
            }
        };

        const timer = setTimeout(handleTyping, isDeleting ? deleteSpeed : typeSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, index]);

    return (
        <span className="inline-block min-w-[300px] text-left">
            Tu <span className="text-orange-600">{displayText}</span>
            <span className="animate-pulse">|</span>
        </span>
    );
}
