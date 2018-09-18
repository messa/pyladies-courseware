import React from 'react'
import { Button } from 'semantic-ui-react'
import ALink from '../ALink'

const items = [
  {
    href: '/admin/users',
    label: 'Uživatelé',
    icon: 'users',
  },
]

export default () => (
  <div className='AdminNavigation'>
    {items.map(item => (
      <span key={item.href}>
        <Button
          content={item.label}
          icon={item.icon} labelPosition='left' color='red'
          as={ALink} href={item.href}
        />
      </span>
    ))}
  </div>
)
