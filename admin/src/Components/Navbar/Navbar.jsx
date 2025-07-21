import React from "react";
import './Navbar.css'
import navlogo from '../../assets/nav-logo.png'
import navProfile from '../../assets/nav-profile.jpeg'

const Navbar = () => {
    return (
        <div className="navbar">
            <img src={navlogo} alt="" className="nav-logo"></img>
            <img src={navProfile} className="nav-profile" alt="" ></img>
        </div>
    )
}

export default Navbar