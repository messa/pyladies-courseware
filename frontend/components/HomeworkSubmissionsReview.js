import React from 'react'
import { Tab } from 'semantic-ui-react'
import HomeworkComments from './HomeworkComments'


const panes = [
  { menuItem: 'Tab 1', render: () => <Tab.Pane>Tab 1 Content<HomeworkComments /></Tab.Pane> },
  { menuItem: 'Tab 2', render: () => <Tab.Pane>Tab 2 Content<HomeworkComments /></Tab.Pane> },
  { menuItem: 'Tab 3', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  { menuItem: 'Tab 4', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
  { menuItem: 'Tab 5', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
  { menuItem: 'Tab 6', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
]

const TabExampleVerticalTabular = () => (
  <Tab menu={{ fluid: true, vertical: true, tabular: true }} panes={panes} />
)


export default class HomeworkSubmissionsReview extends React.Component {

  render() {
    return (
      <div className='HomeworkSubmissionsReview'>
        <h4>Odevzdaná řešení</h4>
        <TabExampleVerticalTabular />
      </div>
    )
  }

}
