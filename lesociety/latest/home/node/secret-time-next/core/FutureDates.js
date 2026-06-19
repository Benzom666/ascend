import React from 'react'

function FutureDates(props) {
  const {title,contentaboutDating} =props
  return (
    <div className='container d-flex justify-content-center align-items-center future-header-main'>
         <nav className="navbar navbar-dark bg-#080808 w-lg-50 d-flex justify-content-center futuredate-header">
            <div className='heading-title'>
            <h5 dangerouslySetInnerHTML={{__html:title}}></h5>
            </div>
            <div className='futureDatingContent'>
            <p>{contentaboutDating}</p>
            </div>
        </nav>
    </div>
  )
}

export default FutureDates