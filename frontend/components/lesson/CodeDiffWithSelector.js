import React, {PureComponent} from 'react'
import ReactDiffViewer from 'react-diff-viewer';


/**
 * Sorts versions from newest to oldest.
 */
function sortVersions(versions) {
  return versions.slice().sort((a, b) => b.date.localeCompare(a.date))
}

function selectDefaultVersions(versions) {
  if (versions.length === 1) {
    return [versions[0].id, versions[0].id]
  }

  return [versions[1].id, versions[0].id]
}

function formatDate(dt) {
  return new Date(dt).toLocaleString()
}

function VersionColumn(props) {
  const versions = props.versions
  const selectedId = props.selectedId
  const disabledId = props.disabledIndex
  const onChange = props.onChange

  return (
    <>
      <div className='wrapper'>
        {versions.map((version, index) => <div key={version.id} className='row'>
            <input type='checkbox'
                   disabled={version.id === disabledId ? 'disabled' : null}
                   checked={version.id === selectedId}
                   onChange={() => onChange(version.id)}
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
        <VersionColumn className='column' versions={versions} selectedId={left}
                       disabledIndex={right}
                       onChange={onChangeLeft}/>
        <VersionColumn className='column' versions={versions} selectedId={right}
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

function findVersionById(versions, id) {
  return versions.find((version) => version.id === id) ?? null
}

class CodeDiffWithSelector extends PureComponent {
  constructor(props) {
    super(props)

    const versions = sortVersions(props.versions)
    const [left, right] = selectDefaultVersions(versions)
    this.state = {
      left,
      right,
      versions
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.versions !== this.props.versions) {
      const versions = sortVersions(this.props.versions)

      let left = this.state.left
      if (findVersionById(versions, left) === null) {
        left = versions[0].id
      }

      let right = this.state.right
      if (findVersionById(versions, right) === null) {
        right = versions[0].id
      }

      this.setState({
        left,
        right,
        versions
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

  highlightSyntax = (str)  => (
    <code
      className='language-python'
      style={{display: 'inline'}}
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(str, Prism.languages.python),
      }}
    />
  )

  render() {
    const left = findVersionById(this.state.versions, this.state.left)?.code ?? ""
    const right = findVersionById(this.state.versions, this.state.right)?.code ?? ""
    const stylesOverride = {
      diffContainer: {
        pre: {
          lineHeight: 'inherit',
        },
      },
    }

    return (
      <>
        <div>
          <div className="diff-wrapper">
            <ReactDiffViewer
              oldValue={left}
              newValue={right}
              splitView={false}
              showDiffOnly={false}
              renderContent={this.highlightSyntax}
              styles={stylesOverride}
            />
          </div>
          <VersionSelector
            versions={this.state.versions}
            left={this.state.left}
            right={this.state.right}
            onChangeLeft={this.changeLeft}
            onChangeRight={this.changeRight}
          />
        </div>
        <style jsx>{`
          .diff-wrapper {
            font-size: 12px;
            line-height: 16px !important;
          }
        `}</style>
      </>
    )
  }
}

export default CodeDiffWithSelector
