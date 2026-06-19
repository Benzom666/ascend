import React, {useState, useCallback} from 'react';
import { Image } from "react-bootstrap";
import ProfileImage from "../../assets/images/profleIamge.svg";
import ImageViewer from 'react-simple-image-viewer';

const ProfileImages = ({ img = [], imageVerified = true, unVerifiedImages = [] }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };
  let ImageArr = unVerifiedImages.length !== 0 && !imageVerified ? unVerifiedImages : img;
  return (<React.Fragment>
    <div className="userProfileImage">
      {ImageArr.length ?
        ImageArr.map((image,index) => {
          return <Image src={image} onClick={ () => openImageViewer(index) }/>
        })
        : <Image src={ProfileImage} />
      }
      
    {isViewerOpen && (
      <div className="userProfileImage-inner">
        <ImageViewer
          src={ ImageArr }
          currentIndex={ currentImage }
          disableScroll={ true }
          closeOnClickOutside={ true }
          onClose={ closeImageViewer }
          closeComponent={"X"}
          backgroundStyle={{zIndex: 11111111}}
        />
      </div>
      )}
    </div>
    

    </React.Fragment>
  )
}
export default ProfileImages;