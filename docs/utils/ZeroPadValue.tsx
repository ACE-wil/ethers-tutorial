/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xiejiahe xjh22222228/ethers-tutorial. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import { ethers } from "ethers";
import { Button, notification, Modal, Form, Input, InputNumber } from "antd";

const Component: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  async function handleOk() {
    notification.destroy();
    try {
      const values = await form.getFieldsValue();
      let v = values.value;
      if (v.startsWith("[") && v.endsWith("]")) {
        try {
          v = new Uint8Array(JSON.parse(v));
        } catch (error) {}
      }
      const value = ethers.zeroPadValue(v, values.length);

      notification.success({
        duration: 0,
        message: "结果",
        description: (
          <>
            <div>{String(value)}</div>
          </>
        ),
      });
    } catch (error: any) {
      notification.error({
        duration: 0,
        message: "Error",
        description: error.message,
      });
    }
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal
        title="zeroPadValue"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          preserve={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          autoComplete="off"
        >
          <Form.Item initialValue="[89, 47, 167]" label="输入" name="value">
            <Input />
          </Form.Item>

          <Form.Item initialValue={10} label="长度" name="length">
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
      <Button type="primary" onClick={showModal}>
        zeroPadValue
      </Button>
    </>
  );
};

export default Component;
