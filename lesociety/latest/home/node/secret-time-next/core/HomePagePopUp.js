import React from 'react'
const Group246 = "/assets/img/Group 246.png"
const HomePagePopUpImage = "/assets/img/HomePagePopUp_image.png";



const modal_Content = {
  mainContent_1: "Ever since men and women have been populating earth, men have been chasing their dream date. But achieving this, is just not possible for every man. The question is, how can you incentivize women to go on a date if she’s not interested?  ",
  mainContent_2: "For decades people have been paying for line by-pass, so we decided to bring this concept into the online dating industry.",
  mainContent_3: "It’s time to uberize the dating industry and bridge the gap between beautiful women and men that can sometimes be overlooked. A service that empowers women, allowing them to benefit from financial incentives in exchange for their time providing companionship for any occasion or even the opportunity for a long-term relationship. Thus, creating a dating service that not only benefits and incentivizes both parties, but allows men to secure their dream dates faster than any other platform.",
}

function HomePagePopUp({show,onClose}) {
  
  return (
    <div className='modal_2' onClick={onClose}>
      <div className='modal_content_2'>
        <div className='modal_header'>
          <img src={Group246} alt="modal_logo" width="246px" />
        </div>
        <div className='modal_main_content'>
          <div className='modal_main_img'>
            <img src={HomePagePopUpImage} alt="modal_main_img" width="100%"/>
          </div>
          <div className='modal_heading'>
            <h2>OUR STORY</h2>
          </div>
          <div className='modal_main_content'>
            <p className='modal_main_content-1'>{modal_Content.mainContent_1}</p>
            <p className='modal_main_content-2'>{modal_Content.mainContent_2}</p>
            <p className='modal_main_content-3'>{modal_Content.mainContent_3}</p>
          </div>
          </div>
          <div className='modal_footer'>
          <div className='modal_btn'>
            <a href='./home'>
              <button type='button' className='modal_button'>
                Take me to homepage</button>
            </a>
          </div> 
        </div>
      </div>

    </div>
  )

}

export default HomePagePopUp