import React, { useState, useEffect } from 'react'
import styled from "styled-components";
const ClassSelection = (props) => {
    const [options, setOptions] = useState(props.options)
    const onChange = (value) => {
        const { input: { onChange } } = props
        onChange(value)
    }
    useEffect(() => {
        if(props.defaultChecked) props.input.onChange(props.defaultChecked)
    }, [])
    const { input, meta: { warning, touched, error }} = props  

    return(
        <ClassSelectionStyle className="class_select_wrap" style={{color: props.textColor}} checkColor={{checked: props.checkedColor}}>
            {options && options.map((option, index) => {
                return <div className="radio_groups">

                        {<div className='rate-tag'>
                           <span className="price-tag">{option.rate}</span>
                      </div>}
                        <input 
                            type="radio"
                            id={option.id}
                            checked={option.id === input.value.id}
                            key={index} 
                            onChange={()=>onChange({id: option.id, label: option.label, icon: option.icon, category: option.category})}
                        />
                        <div className="active_class">
                            <span>{option.icon}</span>
                            <label className={option.id === "WineDine" && "manage-width"} htmlFor={option.id}>{option.label}</label> 
                        </div>
                        {touched && ((error && <span className="error">{error}</span>) || (warning && <span>{warning}</span>))}
                    </div>
            })}
        </ClassSelectionStyle>
    )
}
export default ClassSelection

const ClassSelectionStyle = styled.div`
    display:flex;
    align-items:center;
    flex-wrap:wrap;
    color: #AFABAB;
    margin:15px -5px 0;
    .radio_groups{
        margin-right:0px;
        padding: 5px;
        width: 33.3%;
        position:relative;
        .active_class {
            height:133px;
            display: flex;
            align-items: center;
            flex-direction: column;
            min-height: 90px;
            border: 1px solid #293036;
            justify-content: center;
            padding: 15px;
            border-radius: 13px;
            text-align:center;
            span{
                display:inline-block;
                margin-bottom:10px;
            }
            @media only screen and (max-width: 767px) {
                height:100px;
                span{
                    margin-bottom:5px;
                    svg{
                        width:24px;
                        height:24px;
                    }
                }
            }
        }
        
        input{
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
            z-index: 1;
            opacity: 0;
            & ~ div.active_class label{
                font-size:14px;
                font-weight:500;
                line-height: 18px;
                padding-left:0px;
                position:relative;
                @media only screen and (max-width: 767px) {
                    font-size:10px;
                    line-height:15px;
                    span{
                    }
                }
            }
            &:checked{
                & ~ div.active_class label{
                    color:${props => props.checkColor.checked};
                    &:before{
                        border: 2px solid ${props => props.checkColor.checked};
                    }
                }
                & ~ div.active_class{
                    border-color:${props => props.checkColor.checked};
                    span{
                        svg{
                            color:${props => props.checkColor.checked};
                            fill:${props => props.checkColor.checked};
                            path, g, rect{
                                fill:${props => props.checkColor.checked};
                            }

                        }
                    }
                }
            }
        }
       
    }
`;