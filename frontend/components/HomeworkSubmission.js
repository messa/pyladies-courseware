import React from 'react'
import { Button } from 'semantic-ui-react'
import HomeworkSubmitForm from './HomeworkSubmitForm'

export default class HomeworkSubmission extends React.Component {

  state = {
    //open: false,
    open: true,
  }

  handleOpenButton = () => {
    this.setState({ open: true })
  }

  render() {
    const { open } = this.state
    return (
      <div className='HomeworkSubmission'>
        {!open ? (
          <Button
            basic
            size='tiny'
            color='blue'
            content='Odevzdat'
            icon='reply'
            onClick={this.handleOpenButton}
          />
        ) : (
          <div style={{ animation: 'slide-up 0.4s ease' }}>
            <HomeworkSubmitForm />
          </div>
        )}
        <style jsx>{`
          .HomeworkSubmission {
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }
}
