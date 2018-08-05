import React from 'react'
import { Tab } from 'semantic-ui-react'
import HomeworkComments from './HomeworkComments'

class TabExampleVerticalTabular extends React.Component{

  render() {
    const panes = [
      {
        menuItem: 'Tab 1',
        render: () => (<span>Tab 1 Content<HomeworkComments /></span>),
      }, {
        menuItem: 'Tab 2',
        render: () => (<span>Tab 2 Content<HomeworkComments /></span>),
      }, {
        menuItem: 'Tab 3',
        render: () => (<span>Tab 3 Content</span>),
      }, {
        menuItem: 'Tab 4',
        render: () => (<span>Tab 1 Content</span>),
      }, {
        menuItem: 'Tab 5',
        render: () => (<span>Tab 2 Content</span>),
      }, {
        menuItem: 'Tab 6',
        render: () => (<span>Tab 3 Content</span>),
      },
    ]
    return (
      <Tab
        menu={{ fluid: true, vertical: true, tabular: true }}
        panes={panes}
        renderActiveOnly={true}
        defaultActiveIndex={0}
      />
    )
  }

}

export default class HomeworkSubmissionsReview extends React.Component {

  state = {
    show: false,
  }

  render() {
    const { show } = this.state
    return (
      <div className='HomeworkSubmissionsReview'>
        <h4>Odevzdaná řešení</h4>
        {!show ? (
          <p>Loading</p>
        ) : (
          <TabExampleVerticalTabular />
        )}
      </div>
    )
  }

}
