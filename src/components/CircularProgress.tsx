import React from 'react';

interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
    className?: string;
    progressColor?: string;
    backgroundColor?: string;
}

export default function CircularProgress({
    progress,
    size = 40,
    strokeWidth = 4,
    showPercentage = true,
    className = '',
    progressColor = '#FF0054',
    backgroundColor = '#181818'
}: CircularProgressProps) {
    // Ensure progress is between 0 and 100
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);
    
    // Calculate circle properties
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (normalizedProgress / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={size}
                height={size}
                className={`transform -rotate-90 ${className}`}
            >
                {/* Background circle */}
                <circle
                    style={{ stroke: backgroundColor }}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress circle */}
                <circle
                    style={{ stroke: progressColor }}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    className="transition-all duration-300 ease-in-out"
                />
            </svg>
            {showPercentage && (
                <span className="absolute text-white text-sm font-medium">
                    {Math.round(normalizedProgress)}%
                </span>
            )}
        </div>
    );
} 