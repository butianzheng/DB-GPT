import { Popover, ConfigProvider, Modal, Badge } from 'antd';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ClockCircleOutlined, DeleteFilled, MessageFilled, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { ISpace } from '@/types/knowledge';
import DocPanel from './doc-panel';
import moment from 'moment';
import { apiInterceptors, delSpace, newDialogue } from '@/client/api';
import { useTranslation } from 'react-i18next';
import { VECTOR_ICON_MAP } from '@/utils/constants';
import GptCard from '../common/gpt-card';

interface IProps {
  space: ISpace;
  onAddDoc: (spaceName: string) => void;
  getSpaces: () => void;
}

const { confirm } = Modal;

export default function SpaceCard(props: IProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { space, getSpaces } = props;

  const showDeleteConfirm = () => {
    confirm({
      title: t('Tips'),
      icon: <WarningOutlined />,
      content: `${t('Del_Knowledge_Tips')}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        await apiInterceptors(delSpace({ name: space?.name }));
        getSpaces();
      },
    });
  };

  function onDeleteDoc() {
    getSpaces();
  }

  const handleChat = async () => {
    const [_, data] = await apiInterceptors(
      newDialogue({
        chat_mode: 'chat_knowledge',
      }),
    );
    if (data?.conv_uid) {
      router.push(`/chat?scene=chat_knowledge&id=${data?.conv_uid}&db_param=${space.name}`);
    }
  };

  const renderVectorIcon = (type: string) => {
    return (
      <Image
        className="rounded-full w-8 h-8 border border-gray-200 object-contain bg-white inline-block"
        width={36}
        height={136}
        src={VECTOR_ICON_MAP[type] || '/models/knowledge-default.jpg'}
        alt="llm"
      />
    );
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Popover: {
            zIndexPopup: 90,
          },
        },
      }}
    >
      <Popover
        className="cursor-pointer"
        placement="bottom"
        trigger="click"
        content={<DocPanel space={space} onAddDoc={props.onAddDoc} onDeleteDoc={onDeleteDoc} />}
      >
        <Badge className="mb-4 min-w-[200px] sm:w-60 lg:w-72" count={space.docs || 0}>
          <GptCard
            title={space.name}
            desc={space.desc}
            icon={VECTOR_ICON_MAP[space.vector_type] || '/LOGO_SMALL.png'}
            iconBorder={false}
            tags={[
              {
                text: (
                  <>
                    <UserOutlined className="mr-1" />
                    {space?.owner}
                  </>
                ),
              },
              {
                text: (
                  <>
                    <ClockCircleOutlined className="mr-1" />
                    {moment(space.gmt_modified).format('YYYY-MM-DD')}
                  </>
                ),
              },
            ]}
            operations={[
              {
                label: t('Chat'),
                children: <MessageFilled />,
                onClick: handleChat,
              },
              {
                label: t('Delete'),
                children: <DeleteFilled />,
                onClick: () => {
                  showDeleteConfirm();
                },
              },
            ]}
          />
        </Badge>
      </Popover>
    </ConfigProvider>
  );
}
