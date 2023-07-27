import React from 'react'
import * as xlsx from 'xlsx'
import { Button, Card, Elevation, Classes, Icon, FileInput, AnchorButton, HTMLTable } from '@blueprintjs/core'
import config from '../../../../../packages/bp/dist/data/botpress.config.schema.json'
// import qna from "../../../assets/config.schema.json"
// import React, { useEffect, useState } from 'react'

export default class MyMainView extends React.Component {
  // state = {
  //   result: {},
  //   file : ""
  // }

  constructor(props) {
    super(props)
    console.log(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      config: [],
      result: {},
      file: '',
      data: [],
      finalResult: {}
    }
  }

  handleClick(e) {
    this.refs.fileUploader.click()
  }
  componentDidMount() {
    this.fetch()
    this.fetchConfig()
  }
  async fetch() {
    // console.log('config', config.properties.fileUpload.properties.allowedMimeTypes.default[0])
    const result = await this.props.bp.axios.get('mod/custom-module-rijan/title')
    console.log(result)
    this.setState({ result })
    return result
  }
  async fetchConfig() {
    const config = await this.props.bp.axios.get('mod/custom-module-rijan/config')
    console.log(config.data.allowedMimeTypes)
    this.setState({ config: config.data.allowedMimeTypes })
    // console.log(this.state.config)
    return config
  }

  checkType() {
    console.log(this.state.file.type)
    for (let i = 0, j = this.state.config.length; i < j; i++) {
      if (this.state.config[i] == this.state.file.type) {
        return true
      }
    }
    return false
  }

  filePathSet(e) {
    e.stopPropagation()
    e.preventDefault()
    const file = e.target.files[0]
    // console.log('file: ', file)
    this.setState({ file })
    this.uploadFile(file)
    // console.log('state file: ', this.state.file)
  }

  async uploadFile(file) {
    var sendData = new FormData()
    // sendData.append('allowedMimeTypes', this.state.config)
    sendData.append('file', file)
    // console.log('sendData_allMime', sendData.get('allowedMimeTypes'))
    console.log('sendData_file', sendData.get('file'))
    const upload = await this.props.bp.axios.post('mod/custom-module-rijan/upload', sendData)
    console.log('upload', upload)
    return
  }

  readFile() {
    if (!this.checkType()) return
    const f = this.state.file
    const name = f.name
    const reader = new FileReader()
    reader.onload = evt => {
      /* Parse data */
      const bstr = evt.target.result
      const wb = xlsx.read(bstr, { type: 'binary' })
      /* Get first worksheet */
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      /* Convert array of arrays */
      const data = xlsx.utils.sheet_to_csv(ws, { header: 1 })
      /* Update state */
      // console.log(this.convertToJson(data)) // shows data in json format
      this.setState({ data: this.convertToJson(data) })
      console.log('from state data: ', this.state.data)
      const finalResult = []
      console.log('after state data:', this.state.data[0].sno)
      for (let i = 1, j = this.state.data.length; i < j; i++) {
        if (this.state.data[i - 1].sno != this.state.data[i].sno || i + 1 == j) {
          finalResult.push({
            id: this.state.data[i - 1].sno,
            data: {
              questions: {
                en: []
              },
              answers: {
                en: [this.state.data[i - 1].answer]
              },
              redirectFlow: '',
              redirectNode: '',
              action: 'text',
              enabled: true,
              contexts: ['global']
            }
          })
        }
      }

      for (let a = 0, b = finalResult.length; a < b; a++) {
        for (let i = 1, j = this.state.data.length; i < j; i++) {
          if (this.state.data[i - 1].sno == a + 1) {
            finalResult[a].data.questions.en.push(this.state.data[i - 1].questions)
          }
        }
      }

      // for (let i = 1, j = this.state.data.length; i < j; i++) {
      //   // console.log(this.state.data[i - 1].sno, i - 1)
      //   // console.log(this.state.data[i].sno, i)

      //   tempResult.data.questions.en[i - 1] = this.state.data[i - 1].questions
      //   if (this.state.data[i - 1].sno != this.state.data[i].sno || i + 1 == j) {
      //     console.log('asd')
      //     tempResult.id = this.state.data[i - 1].sno
      //   }
      //   // if (i == 1 || this.state.data[i - 1].sno != this.state.data[i]?.sno) {
      //   //   tempResult.id = this.state.data[i - 1].sno
      //   //   tempResult.answer = this.state.data[i - 1].answer.en[0]
      //   // }
      // }
      //console.log('tempResult', tempResult)
      console.log('finalResult', finalResult)
      this.setState({ qna: { qnas: finalResult } })
    }
    reader.readAsBinaryString(f)
  }

  convertToJson(csv) {
    const lines = csv.split('\n')
    const result = []
    const result2 = []
    const headers = lines[0].split(',')
    for (let i = 1; i < lines.length; i++) {
      const obj = {}
      const currentline = lines[i].split(',')
      if (currentline[1] != '') {
        if (currentline[0] == '') {
          currentline[0] = result[i - 2].sno
        }
        if (currentline[2] == '') {
          currentline[2] = result[i - 2].answer
        }
      }

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]
      }
      if (obj.questions != '') {
        result.push(obj)
        // console.log(obj)
      }
    }

    //return result; //JavaScript object
    return result //JSON
  }

  render() {
    let table
    if (this.state.data.length) {
      table = (
        <div style={{ maxHeight: '480px', overflow: 'scroll' }}>
          <HTMLTable bordered={true} compact={true} interactive={true} striped={true}>
            <thead>
              <tr>
                <th>Questions</th>
                <th>Answers</th>
              </tr>
            </thead>
            <tbody>
              {this.state.data.map(data => (
                <tr>
                  <td>{data.questions}</td>
                  <td>{data.answer}</td>
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        </div>
      )
    } else {
      table = <div></div>
    }
    return (
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          <Card
            interactive={true}
            style={{
              border: 'none'
            }}
            // style={{
            //   display: 'flex',
            //   justifyContent: 'center'
            // }}
          >
            <h2 class="bp5-heading">{this.state.result.data && this.state.result.data.message}</h2>
            <FileInput large={true} text="Add xlsx File" buttonText="Upload" onChange={this.filePathSet.bind(this)} />

            {/* <Button intent="primary" outlined={true} active={true} size="large">
              Submit
            </Button> */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <Button
                class="bp5-button"
                intent="warning"
                outlined={true}
                minimal={true}
                size="large"
                onClick={() => {
                  this.readFile()
                }}
              >
                <Icon icon="repeat" /> &nbsp; &nbsp;Read File <Icon />
              </Button>

              <AnchorButton
                intent="success"
                outlined={true}
                minimal={true}
                size="large"
                href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.state.qna))}`}
                download="dummier.json"
              >
                <Icon icon="import" />
                &nbsp; &nbsp; Download Json <Icon />
              </AnchorButton>
              <AnchorButton
                intent="primary"
                outlined={true}
                minimal={true}
                href="/assets/modules/custom-component/qna.xlsx"
                download="sample.xlsx"
              >
                <Icon icon="archive" />
                &nbsp; &nbsp; Download Sample
                <Icon />
              </AnchorButton>
              {/* <button onClick={this.downloadFile}>Download XLSX</button> */}
              {/* <a href="/assets/modules/custom-module-rijan/qna.xlsx" download>
                <button>Download excel file</button>
              </a> */}
            </div>
          </Card>
        </div>
        <br />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {table}
        </div>
        <br />
      </div>
    )
  }
}

// export default MyMainView
