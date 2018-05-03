import React, { Component } from 'react';
import style from './style.scss';
import { Dialog, FlatButton } from 'material-ui';
import Cropper from 'react-cropper';
import './cropper.scss';
import axios from 'axios';
import tr from '../../utils/translate';

import { generateId } from '../../utils';
function scaleImage(dataURI, size) {
  return new Promise((res) => {
    let img = new Image;
    img.src = dataURI;
    img.onload = () => {
      let canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      let blobBin = atob(canvas.toDataURL().split(',')[1]);
      let array = [];
      for (let i = 0; i < blobBin.length; i++) {
        array.push(blobBin.charCodeAt(i));
      }
      let file = new Blob([new Uint8Array(array)], { type: 'image/png' });

      res(file);
    }
  });
}

function upload(fileData, filename) {
  if (process.env.NODE_ENV === 'production') {
    return axios.request({
      url: '/upload',
      data: fileData,
      method: 'POST',
    }).then((res) => {
      return res.data.file;
    });
  } else {
    return axios.request({
      url: 'http://localhost:3030',
      data: fileData,
      method: 'POST',
    }).then(() => {
      return 'http://localhost:3030/' + filename;
    });

  }
}


export default class ImageDialog extends Component {
  state = {
    dataUrl: null,
    uploading: false,
  }

  _onChange(evt) {
    let reader = new FileReader();
    reader.readAsDataURL(evt.target.files[0]);
    reader.onload = (event) => {
      let dataUrl = event.target.result;
      this.setState({ dataUrl });
    };
  }
  upload() {
    const { onUpload } = this.props;

    this.setState({ uploading: true });
    let filename = generateId() + '.png';

    scaleImage(this.cropper.getCroppedCanvas().toDataURL(), 350).then(data => {
      let fileData = new FormData();
      fileData.append('file', data, filename);
      return upload(fileData, filename).then((name) => {onUpload(name)});
    }).catch(() => {
      this.setState({ uploading: false });
    })
  }

  componentWillUnmount() {
    this._onChange = () => {};
  }
  render() {
    const { dataUrl, uploading } = this.state;
    const { onClose } = this.props;
    let chooseFile = <FlatButton
      label={dataUrl ? tr('Choose New File') : tr('Choose File')}
      primary
      disabled={uploading}
      onTouchTap={(e) => { e.preventDefault(); this.fileInput.click() } }
            />
    let close = <FlatButton
      label={tr('Cancel')}
      primary
      disabled={uploading}
      onTouchTap={() => onClose() }
            />
    let upload = <FlatButton
      label={tr('Upload')}
      primary
      disabled={uploading}
      onTouchTap={() => this.upload()} />;

    let actions = dataUrl ? [chooseFile, upload, close] : [chooseFile, close];


    return <Dialog
      className={style.imageQuestionDialog}
      open
      actions={actions}
           >
      <h4>{tr('Add an image')}</h4>
      { dataUrl && <Cropper src={dataUrl || ''}
          style={{ height: 400, width: '100%' }}
          guides
          aspectRatio={1}
          ref={r => this.cropper = r}
                     />}
      <input type='file' accept='image/*' onChange={this._onChange.bind(this)} ref={(r) => this.fileInput = r} />
    </Dialog>
  }
}
