import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import userService from '../../services/user';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import MediaUpload from '../../components/upload';
import { DebounceSelect } from '../../components/search';
import shopService from '../../services/restaurant';
import { fetchUsers } from '../../redux/slices/user';

export default function UserAddRole() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [date, setDate] = useState();
  const [error, setError] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user, shallowEqual);
  const { role } = useParams();

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.birthday = JSON.stringify(data?.birthday);
      dispatch(
        setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeData = (data, dataText) => setDate(dataText);
  const locations = useLocation();
  const activeMenu = useSelector((list) => list.menu.activeMenu);
  const dispatch = useDispatch();
  const [image, setImage] = useState(
    activeMenu?.data?.image ? [activeMenu?.data?.image] : []
  );
  const [fields, setFields] = useState([]);

  async function fetchUserShop(search) {
    const params = { search, status: 'approved' };
    return shopService.search(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation !== null ? item.translation.title : 'no name',
        value: item.id,
      }))
    );
  }

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.user_email,
      phone: values.phone,
      birthday: date,
      gender: values.gender,
      password_confirmation: values.password_confirmation,
      password: values.password,
      images: image[0] ? [image[0]?.name] : undefined,
      shop_id: values?.shop_id
        ? values?.shop_id.length !== undefined
          ? values?.shop_id?.map((item) => item.value)
          : [values?.shop_id.value]
        : undefined,
      role: role ? role : undefined,
      online: Number(values.online),
      height: values.height,
      kg: values.kg,
      length: values.length,
      price: values.price,
      price_per_km: values.price_per_km,
      width: values.width,
    };
    userService
      .create(body)
      .then(({ data }) => {
        const menu = 'users/admin';
        const userParamsData = {
          ...user.params,
          role: data.role,
        };
        dispatch(removeFromMenu({ ...activeMenu, menu }));
        navigate(`/${menu}`);
        dispatch(fetchUsers(userParamsData));

        form.resetFields();
      })
      .catch((err) => {
        if (!!err?.response?.data?.params) {
          toast.dismiss();
          Object.values(err?.response?.data?.params)?.map((errorArray) =>
            toast.error(errorArray[0])
          );
        }
        console.log(err?.response?.data?.params);
        setError(err?.response?.data?.params);
      })
      .finally(() => setLoadingBtn(false));
  };

  const getInitialTimes = () => {
    if (!activeMenu.data?.birthday) {
      return {};
    }
    const birthday = JSON.parse(activeMenu.data?.birthday);
    return {
      birthday: moment(birthday),
    };
  };

  return (
    <Card title={t('add.user')}>
      <Form
        form={form}
        layout='vertical'
        initialValues={{
          online: true,
          gender: 'male',
          ...getInitialTimes(),
        }}
        onFinish={onFinish}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  validator() {
                    if (image?.length === 0) {
                      return Promise.reject(new Error(t('required')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              name='images'
              label={t('avatar')}
            >
              <MediaUpload
                type='users'
                imageList={image}
                setImageList={setImage}
                form={form}
                multiple={false}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('firstname')}
              name='firstname'
              help={error?.firstname ? error.firstname[0] : null}
              validateStatus={error?.firstname ? 'error' : 'success'}
              rules={[
                {
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 2) {
                      return Promise.reject(new Error(t('must.be.at.least.2')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={'lastname'}
              name='lastname'
              help={error?.lastname ? error.lastname[0] : null}
              validateStatus={error?.lastname ? 'error' : 'success'}
              rules={[
                {
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error(t('required')));
                    } else if (value && value?.trim() === '') {
                      return Promise.reject(new Error(t('no.empty.space')));
                    } else if (value && value?.trim().length < 2) {
                      return Promise.reject(new Error(t('must.be.at.least.2')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('phone')}
              name='phone'
              help={error?.phone ? error.phone[0] : null}
              validateStatus={error?.phone ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <InputNumber min={0} className='w-100' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('birthday')}
              name='birthday'
              rules={[{ required: true, message: t('required') }]}
            >
              <DatePicker
                onChange={changeData}
                className='w-100'
                disabledDate={(current) =>
                  moment().add(-18, 'years') <= current
                }
                defaultPickerValue={moment().add(-18, 'years')}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('gender')}
              name='gender'
              rules={[{ required: true, message: t('required') }]}
            >
              <Select picker='dayTime' className='w-100'>
                <Select.Option value='male'>{t('male')}</Select.Option>
                <Select.Option value='female'>{t('female')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('email')}
              name='user_email'
              help={error?.email ? error.email[0] : null}
              validateStatus={error?.email ? 'error' : 'success'}
              rules={[
                { required: true, message: t('required') },
                {
                  type: 'email',
                  message: t('invalid.email'),
                },
              ]}
            >
              <Input type='email' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('password')}
              name='password'
              help={error?.password ? error.password[0] : null}
              validateStatus={error?.password ? 'error' : 'success'}
              rules={[
                { required: true, message: t('required') },
                {
                  validator(_, value) {
                    if (value && value?.length < 6) {
                      return Promise.reject(new Error(t('min.6.letters')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              normalize={(value) =>
                value?.trim() === '' ? value?.trim() : value
              }
            >
              <Input.Password type='password' className='w-100' />
            </Form.Item>
          </Col>

          {role !== 'admin' &&
            role !== 'manager' &&
            role !== 'moderator' &&
            role !== 'seller' &&
            role !== 'cook' &&
            role !== 'user' && (
              <Col span={12}>
                <Form.Item
                  label={t('shop')}
                  name='shop_id'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <DebounceSelect
                    mode='multiple'
                    className='w-100'
                    placeholder={t('select.shop')}
                    fetchOptions={fetchUserShop}
                    allowClear={false}
                  />
                </Form.Item>
              </Col>
            )}

          {role === 'cook' && (
            <Col span={12}>
              <Form.Item
                label={t('shop')}
                name='shop_id'
                rules={[{ required: true, message: t('required') }]}
              >
                <DebounceSelect
                  fetchOptions={fetchUserShop}
                  className='w-100'
                  placeholder={t('select.shop')}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
          )}

          {role === 'moderator' && (
            <Col span={12}>
              <Form.Item
                label={t('branches')}
                name='shop_id'
                rules={[{ required: true, message: t('required') }]}
              >
                <DebounceSelect
                  fetchOptions={fetchUserShop}
                  className='w-100'
                  placeholder={t('select.shop')}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item
              label={t('password.confirmation')}
              help={
                error?.password_confirmation
                  ? error.password_confirmation[0]
                  : null
              }
              validateStatus={
                error?.password_confirmation ? 'error' : 'success'
              }
              name='password_confirmation'
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(t('two.passwords.dont.match'));
                  },
                }),
              ]}
              normalize={(value) =>
                value?.trim() === '' ? value?.trim() : value
              }
            >
              <Input.Password type='password' />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
