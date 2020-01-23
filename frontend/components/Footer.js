import React from 'react'

function Footer() {
  return (
    <div className='Footer-wrapper'>
      <div className='Footer-content'>
        <a href='https://github.com/messa/pyladies-courseware'>github.com/messa/pyladies-courseware</a>
      </div>

      <style jsx>{`
        .Footer-wrapper {
          min-height: 50px;
        }
        .Footer-content {
          border-top: 1px solid #999;
          padding: 1rem 16px 0 16px;
          font-size: 12px;
          color: #999;
          text-align: right;
          bottom: 0;
          position: absolute;
          left: 0;
          right: 0;
          min-height: 50px;
        }
        .Footer-content a {
          color: #666;
        }
      `}</style>
    </div>
  )
}

export default Footer
