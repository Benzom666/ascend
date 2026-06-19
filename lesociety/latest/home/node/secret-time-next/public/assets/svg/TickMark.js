import React from 'react'

function TickMark() {

    return (
        <svg
        width="55"
        height="49"
        viewBox="0 0 55 49"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="success_svg_done"
    >
        <path
            d="M13 20C13 20 16.2474 22.9845 18 25C19.7526 27.0155 23 31.5 23 31.5C23 31.5 30.2048 20.8885 36 15.5C41.7952 10.1115 51.5 5 51.5 5"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap='round'
            strokeLinejoin='round'
            className="circle"
        />
        <rect width="49" height="49" rx="16" fill="currentColor" />
        <mask
            id="mask0_2_1437"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="49"
            height="49"
        >
        <rect
            width="49"
            height="49"
            rx="16"
            fill="currentColor"
        />
        </mask>
        <g mask="url(#mask0_2_1437)">
        <path
            d="M14 20C14 20 17.2474 22.9845 19 25C20.7526 27.0155 24 31.5 24 31.5C24 31.5 31.2048 20.8885 37 15.5C42.7952 10.1115 52.5 5 52.5 5"
            stroke="white"
            strokeWidth="5.5"
            strokeLinecap='round'
            strokeLinejoin='round'
            className="circle"
        />
        </g>
    </svg>
    )
}

export default TickMark
