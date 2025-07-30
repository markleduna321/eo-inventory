import{j as e}from"./app-CcLvlhbH.js";const d=({type:r="button",variant:l="primary",size:n="md",disabled:t=!1,isLoading:a=!1,icon:s=null,children:o,onClick:i=null,...g})=>{const b="rounded focus:outline-none focus:ring transition duration-300 inline-flex items-center justify-center",c={primary:"bg-blue-500 text-white hover:bg-blue-600",secondary:"bg-gray-500 text-white hover:bg-gray-600",warning:"bg-yellow-500 text-black hover:bg-yellow-600",danger:"bg-red-500 text-white hover:bg-red-600",info:"bg-teal-500 text-white hover:bg-teal-600",success:"bg-green-500 text-white hover:bg-green-600"},u={sm:"px-2 py-1 text-sm",md:"px-4 py-2 text-base",lg:"px-6 py-3 text-lg"};return e.jsxs("button",{className:`
        ${b} 
        ${u[n]} 
        ${c[l]} 
        ${t?"opacity-50 cursor-not-allowed":""}`,disabled:t,onClick:i,type:r,...g,children:[a?e.jsx("span",{className:"loader mr-2"}):null,s&&e.jsx("span",{className:"mr-2",children:s}),o]})};export{d as default};
