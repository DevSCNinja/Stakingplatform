import React from "react";

import styles from './Button.module.sass';

export const CustomButton = (props) => {
    return (
        <button className={styles.button} onClick={props.onClick} style={props.style}>
            {props.value}
        </button>
    )
}