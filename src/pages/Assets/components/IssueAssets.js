import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { getKeyStore, getUser } from '@/utils/authority';
import { Button, Modal, Form, Input, message, Alert } from 'antd';
import { formatMessage } from 'umi/locale';
import PasswordModal from '@/components/PasswordModal';
// import DdnJS from '@/utils/ddn-js';

const FormItem = Form.Item;

class IssueAssets extends PureComponent {
  state = {
    visible: false,
    errorMessage: '',
    open: false,
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      errorMessage: '',
    });
  };

  handleCreate = e => {
    e.preventDefault();
    this.submit();
    // const { asset, form, dispatch } = this.props;
    // form.validateFields(async (err, values) => {
    //   if (err) {
    //     return;
    //   }
    //   // console.log('Received values of form: ', values);
    //   // 获取到表单中的数据，并转化格式，发送请求
    //   const keystore = getKeyStore();
    //   const { phaseKey } = keystore;
    //   const amount = parseInt(values.amount * 10 ** asset.precision, 10).toString();
    //   const currency = asset.currency || asset.name;
    //   const transaction = await DdnJS.aob.createIssue(currency, amount, phaseKey);
    //   // console.log('transaction', transaction);
    //   dispatch({
    //     type: 'assets/postTrans',
    //     payload: { transaction },
    //     callback: response => {
    //       // console.log('response', response);
    //       if (response.success) {
    //         this.setState({ visible: false });
    //         message.success('发行成功');
    //       } else {
    //         this.setState({ errorMessage: response.error });
    //       }
    //     },
    //   });
    // });
  };

  handlePassword = async password => {
    await this.submit(password);
    this.setState({
      open: false,
    });
  };

  submit = async (password = null) => {
    const { asset, form, dispatch } = this.props;
    form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      // console.log('Received values of form: ', values);
      // 获取到表单中的数据，并转化格式，发送请求
      const keystore = getKeyStore();
      const { phaseKey } = keystore;
      const amount = parseInt(values.amount * 10 ** asset.precision, 10).toString();
      const currency = asset.currency || asset.name;
      const transaction = await DdnJS.aob.createIssue(currency, amount, phaseKey, password);
      // console.log('transaction', transaction);
      dispatch({
        type: 'assets/postTrans',
        payload: { transaction },
        callback: response => {
          // console.log('response', response);
          if (response.success) {
            this.setState({ visible: false });
            message.success('发行成功');
          } else {
            this.setState({ errorMessage: response.error });
          }
        },
      });
    });
  };

  open = () => {
    this.setState({
      open: true,
    });
  };

  render() {
    const { asset, form } = this.props;
    const { getFieldDecorator } = form;
    const { visible, errorMessage, open } = this.state;
    const { haveSecondSign } = getUser();
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          {formatMessage({ id: 'app.asset.issue-asset' })}
        </Button>
        <Modal
          title={formatMessage({ id: 'app.asset.issue-asset' })}
          visible={visible}
          onCancel={this.handleCancel}
          onOk={haveSecondSign ? this.open : this.handleCreate}
          destroyOnClose
        >
          <Form layout="vertical">
            <FormItem label={formatMessage({ id: 'app.asset.asset-name' })}>
              <div>{asset.currency || asset.name}</div>
            </FormItem>
            <FormItem label={formatMessage({ id: 'app.asset.issue-amount' })}>
              {getFieldDecorator('amount', {
                rules: [
                  { required: true, message: 'Please input the assets amount of collection!' },
                ],
              })(<Input type="number" />)}
            </FormItem>
            {errorMessage && <Alert type="error" message={errorMessage} />}
          </Form>
        </Modal>
        <PasswordModal open={open} handlePassword={this.handlePassword} />
      </div>
    );
  }
}

const WrappedLssuanceAssets = Form.create()(IssueAssets);

export default connect(({ assets, loading }) => ({
  submitting: loading.effects['assets/postTrans'],
  assets,
}))(WrappedLssuanceAssets);
