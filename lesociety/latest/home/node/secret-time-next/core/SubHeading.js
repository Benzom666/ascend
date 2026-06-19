
const SubHeading = (props) => {
  if(props.style2){
    return(
      <div className="sub-heading" 
         style={props.style2 ?{fontSize:"18px",fontWeight:"300",color:"#FFFFFF",letterSpacing:"0.07px"}:null}>
            {props.title}    
        </div> 
    )
  }
  return (
        <div className="sub-heading" 
         style={props.style1 ?{fontSize:"16px",fontWeight:"300",color:"#FFFFFF",letterSpacing:"0.07px"}:null}>
            {props.title}    
        </div>      
  );
}

export default SubHeading


