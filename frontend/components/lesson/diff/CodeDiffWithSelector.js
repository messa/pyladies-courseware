import React, {PureComponent} from 'react'
import CodeDiffView from './CodeDiffView'

function sortVersions(versions) {
  return versions.slice().sort((a, b) => b.date.localeCompare(a.date))
}

function selectDefaultVersions(versions) {
  if (versions.length === 1) {
    return [0, 0]
  }

  return [1, 0]
}

function pad(value) {
  return value.toString().padStart(2, '0')
}

function formatDate(dt) {
  dt = new Date(dt)
  return `${pad(dt.getDate())}. ${pad(dt.getMonth())}. ${pad(dt.getFullYear())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

function VersionColumn(props) {
  const versions = props.versions
  const selectedIndex = props.selectedIndex
  const disabledIndex = props.disabledIndex
  const onChange = props.onChange

  return (
    <>
      <div className='wrapper'>
        {versions.map((version, index) => <div key={version.id} className='row'>
            <input type='checkbox'
                   disabled={index === disabledIndex ? 'disabled' : null}
                   checked={index === selectedIndex}
                   onChange={() => onChange(index)}
            />
            <div className='label'>
              Verze #{versions.length - index} ({formatDate(version.date)})
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
      .wrapper:first-child {
        margin-right: 205px;
      }
      .row {
        display: flex;
        align-items: center;
      }
      .label {
        margin-left: 5px;
      }
      `}</style>
    </>
  )
}

function VersionSelector(props) {
  const {versions, onChangeLeft, onChangeRight, left, right} = props
  return (
    <>
      <div className='wrapper'>
        <VersionColumn className='column' versions={versions} selectedIndex={left}
                       disabledIndex={right}
                       onChange={onChangeLeft}/>
        <VersionColumn className='column' versions={versions} selectedIndex={right}
                       disabledIndex={left}
                       onChange={onChangeRight}/>
      </div>
      <style jsx>{`
      .wrapper {
        display: flex;
        margin: 10px 0;
      }
      `}</style>
    </>
  )
}

class CodeDiffWithSelector extends PureComponent {
  constructor(props) {
    super(props)

    const [left, right] = selectDefaultVersions(props.versions)
    this.state = {
      left,
      right,
      versions: sortVersions(props.versions)
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.versions !== this.props.versions) {
      const [left, right] = selectDefaultVersions(this.props.versions)
      this.setState({
        left,
        right,
        versions: sortVersions(this.props.versions)
      })
    }
  }

  changeLeft = (index) => {
    this.setState({
      left: index
    })
  }

  changeRight = (index) => {
    this.setState({
      right: index
    })
  }

  render() {
    const left = this.state.versions[this.state.left].code
    const right = this.state.versions[this.state.right].code

    return (
      <>
        <div>
          <CodeDiffView left={left} right={right}/>
          <VersionSelector
            versions={this.state.versions}
            left={this.state.left}
            right={this.state.right}
            onChangeLeft={this.changeLeft}
            onChangeRight={this.changeRight}
          />
        </div>
      </>
    )
  }
}

export default CodeDiffWithSelector
