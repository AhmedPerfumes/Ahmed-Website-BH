import React from 'react'

function RefundPolicy() {
  return (
    <div className='container mt-5 pt-5'>
      <h4>Returns & Exchanges</h4>
      <p>Effective: June 4, 2026</p>
      <h5 className='mt-5'>1.	Returns or exchanges are only accepted in the following cases:</h5>
      <ul className='fs-5 mt-3 mb-3 pb-3'>
        <li>Wrong item received</li>
        <li>Damaged product received</li>
        <li>Defective item received</li>
      </ul>
      <h5 className=''>2.	Any return or exchange request must be reported within 48 hours from the date of delivery.</h5>
      <h5 className='mt-3'>3.	To process the request, customers must provide:</h5>
      <ul className='fs-5 mt-3 mb-3 pb-3'>
        <li>Order number</li>
        <li>Photos/videos of the product</li>
        <li>Clear description of the issue</li>
      </ul>
      <h5 className='mt-3'>4.	Returned items must:</h5>
      <ul className='fs-5 mt-3 mb-5 pb-5'>
        <li>Be unused and unopened</li>
        <li>Be in original packaging</li>
      </ul>
      <h4>Refund Policy</h4>
      <h5 className='mt-3'>1.	Refunds will only be processed after inspection and approval of the returned item.</h5>
      <h5 className='mt-3'>2.	Approved refunds will be issued through the original payment method within [7-14] business days depending on bank or payment provider processing timelines.</h5>
      <h5 className='mt-3 mb-5 pb-5'>3.	We reserve the right to reject refund or exchange requests if the returned product does not meet the above conditions.</h5>
    </div>
  )
}

export default RefundPolicy