import React from "react";
import { Clock, Bell, Rocket } from "lucide-react";
// import "../styles/comingSoon.css";

export default function ComingSoon() {

  return (

    <div className="coming-container">

      <div className="coming-card">

        <div className="rocket-icon">
          <Rocket size={50}/>
        </div>


        <h1>
          Coming Soon
        </h1>


        <p>
          We are working hard to bring this feature to you.
          Stay tuned for exciting updates.
        </p>


        <div className="coming-info">

          <div>
            <Clock size={22}/>
            <span>
              Under Development
            </span>
          </div>


          <div>
            <Bell size={22}/>
            <span>
              We'll Notify You
            </span>
          </div>

        </div>


        <button className="notify-btn">
          Notify Me
        </button>


      </div>

    </div>

  );
}