import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  const currentYear = new Date().getFullYear()
  return (
    <CFooter className="px-4">
      <div>
        <span className="ms-1">&copy; {currentYear} Bigmall</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://bigmall.lk/" target="_blank" rel="noopener noreferrer">
          Bigmall
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
