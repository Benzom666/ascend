
const H5 = (props) => { 
  // if (props.style1) {
  //   return (
  //     <h5 style={{ fontSize: "22px" }}>
  //       {props.children}
  //     </h5>
  //   )
  // }
  return (

    <h5 style={props.style1 ? { fontSize: "22px",fontWeight:"700" }:null}>
      {props.children}
    </h5>

  );
}

export default H5



