"use client";
import React from "react";

type Address = {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  company: string;
  country: string;
  street_address: string;
  street_address_2: string;
  city: string;
  phone: string;
  email: string;
  is_default: boolean;
};

type Props = {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
};

const AddressCard = ({ address, onEdit, onDelete }: Props) => {
  return (
    <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
      <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
        <div className="flex items-center gap-3">
          <p className="font-medium text-xl text-dark capitalize">{address.type} Address</p>
          {address.is_default && (
            <span className="text-custom-xs text-white bg-blue px-2 py-0.5 rounded-full">
              Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(address)}
            className="text-dark ease-out duration-200 hover:text-blue"
            title="Edit address"
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.95349 1.04163L11.2513 1.04163C11.5965 1.04163 11.8763 1.32145 11.8763 1.66663C11.8763 2.0118 11.5965 2.29163 11.2513 2.29163H10.0013C8.01945 2.29163 6.59593 2.29295 5.51262 2.4386C4.44728 2.58183 3.80501 2.85424 3.3303 3.32896C2.85559 3.80367 2.58318 4.44594 2.43994 5.51127C2.2943 6.59459 2.29297 8.01811 2.29297 9.99996C2.29297 11.9818 2.2943 13.4053 2.43994 14.4886C2.58318 15.554 2.85559 16.1962 3.3303 16.671C3.80501 17.1457 4.44728 17.4181 5.51262 17.5613C6.59593 17.707 8.01945 17.7083 10.0013 17.7083C11.9832 17.7083 13.4067 17.707 14.49 17.5613C15.5553 17.4181 16.1976 17.1457 16.6723 16.671C17.147 16.1962 17.4194 15.554 17.5627 14.4886C17.7083 13.4053 17.7096 11.9818 17.7096 9.99996V8.74996C17.7096 8.40478 17.9895 8.12496 18.3346 8.12496C18.6798 8.12496 18.9596 8.40478 18.9596 8.74996V10.0478C18.9596 11.9714 18.9597 13.479 18.8015 14.6552C18.6396 15.8592 18.3019 16.8092 17.5562 17.5548C16.8105 18.3005 15.8605 18.6383 14.6565 18.8002C13.4803 18.9583 11.9728 18.9583 10.0491 18.9583H9.95349C8.02983 18.9583 6.5223 18.9583 5.34606 18.8002C4.14211 18.6383 3.19209 18.3005 2.44642 17.5548C1.70074 16.8092 1.36296 15.8592 1.20109 14.6552C1.04295 13.479 1.04296 11.9714 1.04297 10.0478V9.95214C1.04296 8.02848 1.04295 6.52095 1.20109 5.34471C1.36296 4.14077 1.70074 3.19075 2.44642 2.44507C3.19209 1.6994 4.14211 1.36161 5.34606 1.19975C6.5223 1.04161 8.02983 1.04162 9.95349 1.04163ZM13.9767 1.89656C15.1167 0.75665 16.9648 0.75665 18.1047 1.89656C19.2446 3.03646 19.2446 4.88461 18.1047 6.02452L12.5646 11.5646C12.2552 11.874 12.0614 12.0679 11.8451 12.2366C11.5904 12.4353 11.3147 12.6056 11.0231 12.7446C10.7755 12.8626 10.5154 12.9493 10.1003 13.0876L7.67985 13.8945C7.23298 14.0434 6.74031 13.9271 6.40723 13.594C6.07415 13.261 5.95785 12.7683 6.1068 12.3214L6.91361 9.90098C7.05196 9.48584 7.13862 9.22579 7.25663 8.97817C7.39563 8.68652 7.56598 8.41089 7.76467 8.15614C7.93338 7.93985 8.12722 7.74603 8.43667 7.43662L13.9767 1.89656ZM17.2208 2.78044C16.5691 2.12869 15.5124 2.12869 14.8606 2.78044L14.5468 3.09429C14.5657 3.17417 14.5922 3.26935 14.629 3.37551C14.7484 3.71973 14.9744 4.17305 15.4013 4.59995C15.8282 5.02685 16.2815 5.25285 16.6257 5.37227C16.7319 5.4091 16.8271 5.43556 16.907 5.45448L17.2208 5.14063C17.8726 4.48888 17.8726 3.43219 17.2208 2.78044ZM15.9223 6.4392C15.4923 6.25429 14.9914 5.95784 14.5174 5.48384C14.0434 5.00983 13.747 4.50898 13.5621 4.07901L9.34922 8.29184C9.00213 8.63894 8.866 8.77659 8.75031 8.92492C8.60745 9.10808 8.48497 9.30625 8.38504 9.51594C8.30411 9.68576 8.24187 9.86907 8.08664 10.3347L7.72673 11.4145L8.58678 12.2745L9.66651 11.9146C10.1322 11.7594 10.3155 11.6972 10.4853 11.6162C10.695 11.5163 10.8932 11.3938 11.0763 11.2509C11.2247 11.1353 11.3623 10.9991 11.7094 10.652L15.9223 6.4392Z"
                fill=""
              />
            </svg>
          </button>

          <button
            onClick={() => onDelete(address.id)}
            className="text-dark ease-out duration-200 hover:text-red"
            title="Delete address"
          >
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.125 8.125C8.125 7.77982 7.84518 7.5 7.5 7.5C7.15482 7.5 6.875 7.77982 6.875 8.125V13.125C6.875 13.4702 7.15482 13.75 7.5 13.75C7.84518 13.75 8.125 13.4702 8.125 13.125V8.125Z"
                fill=""
              />
              <path
                d="M12.5 7.5C12.8452 7.5 13.125 7.77982 13.125 8.125V13.125C13.125 13.4702 12.8452 13.75 12.5 13.75C12.1548 13.75 11.875 13.4702 11.875 13.125V8.125C11.875 7.77982 12.1548 7.5 12.5 7.5Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.08333 2.08333C7.08333 1.39298 7.64298 0.833328 8.33333 0.833328H11.6667C12.357 0.833328 12.9167 1.39298 12.9167 2.08333V2.91666H15.8333C16.1785 2.91666 16.4583 3.19648 16.4583 3.54166C16.4583 3.88684 16.1785 4.16666 15.8333 4.16666H15.2083V15.8333C15.2083 16.8688 14.3688 17.7083 13.3333 17.7083H6.66667C5.63117 17.7083 4.79167 16.8688 4.79167 15.8333V4.16666H4.16667C3.82149 4.16666 3.54167 3.88684 3.54167 3.54166C3.54167 3.19648 3.82149 2.91666 4.16667 2.91666H7.08333V2.08333ZM8.33333 2.08333H11.6667V2.91666H8.33333V2.08333ZM6.04167 4.16666V15.8333C6.04167 16.1785 6.32149 16.4583 6.66667 16.4583H13.3333C13.6785 16.4583 13.9583 16.1785 13.9583 15.8333V4.16666H6.04167Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-7.5">
        <div className="flex flex-col gap-3">
          <p className="text-custom-sm text-dark">
            <span className="font-medium">Name:</span>{" "}
            {address.first_name} {address.last_name}
          </p>
          {address.email && (
            <p className="text-custom-sm text-dark">
              <span className="font-medium">Email:</span> {address.email}
            </p>
          )}
          {address.phone && (
            <p className="text-custom-sm text-dark">
              <span className="font-medium">Phone:</span> {address.phone}
            </p>
          )}
          <p className="text-custom-sm text-dark">
            <span className="font-medium">Address:</span>{" "}
            {address.street_address}
            {address.street_address_2 ? `, ${address.street_address_2}` : ""},
            {" "}{address.city}, {address.country}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
