import React from 'react'

/**
 * MainHeading component displays a section title with a subtitle.
 * Used for headings in sections like "Our Best Sellers".
 * @param {string} title - The main title text.
 * @param {string} subTitle - The subtitle text.
 */
function MainHeading ({title , subTitle}:{title:string;subTitle:string})  {
  return (
    <>
     <span className='uppercase text-accent font-semibold leading-4 text-sm md:text-base'>{subTitle}</span> 
     <h2 className='text-primary font-bold text-3xl md:text-4xl lg:text-5xl italic'>{title}</h2>
    </>
  )
}

export default MainHeading
