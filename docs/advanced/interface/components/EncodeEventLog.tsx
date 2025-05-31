/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xiejiahe xjh22222228/ethers-tutorial. All rights reserved.
 *  Licensed under the MIT License. See License in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import { ethers } from "ethers";
import { Button, notification, Modal, Form, Input } from "antd";

const abi = `
[
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
]
`.trim();
const functionName = `Transfer`.trim();
const value =
  `["0x2cFC43B94126595E8B636fed9fB585fF220Bc97d", "0x817C6Ef5f2EF3CC56ce87942BF7ed74138EC284C", 100n]`.trim();

const Component: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleOk() {
    setLoading(true);
    notification.destroy();
    try {
      const values = await form.getFieldsValue();
      const iface = new ethers.Interface(eval(values.abi));
      const data = iface.encodeEventLog(values.function, eval(values.value));
      console.log(data);
      notification.success({
        duration: 0,
        message: "结果：",
        description: (
          <>
            <pre>{JSON.stringify(data, null, 4)}</pre>
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
    setLoading(false);
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
        title="测试一下"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form
          form={form}
          preserve={false}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          autoComplete="off"
        >
          <Form.Item
            initialValue={abi}
            label="ABI"
            name="abi"
            rules={[{ required: true, message: "请输入ABI" }]}
          >
            <Input.TextArea placeholder="请输入ABI" autoSize={{ minRows: 6 }} />
          </Form.Item>

          <Form.Item
            initialValue={functionName}
            label="事件名"
            name="function"
            rules={[{ required: true, message: "请输入事件名" }]}
          >
            <Input placeholder="请输入事件名" />
          </Form.Item>

          <Form.Item
            initialValue={value}
            label="数组参数"
            name="value"
            rules={[{ required: true, message: "请输入数组参数" }]}
          >
            <Input placeholder="请输入数组参数" />
          </Form.Item>
        </Form>
      </Modal>
      <Button
        className="mb-20"
        type="primary"
        onClick={showModal}
        loading={loading}
      >
        测试一下
      </Button>
    </>
  );
};

export default Component;
