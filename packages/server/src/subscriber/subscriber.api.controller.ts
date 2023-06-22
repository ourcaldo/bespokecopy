import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ApiKeyAccessScopeEnum } from '../apiKey/enum/apikScopeEnum';
import { AppAbility } from '../casl/casl-ability.factory/casl-ability.factory';
import { ApiKey } from '../decorator/ApiKeyId';
import { CheckPolicies } from '../decorator/checkPolicies';
import { ApiKeyAuthGurad } from '../guard/api/apiKeyAuthGuard';
import { ApiPoliciesGuard } from '../guard/api/apiPoliciesGuard';
import { HasApiKeyAccessWithList } from '../guard/api/hasApiKeyAccessWithList';
import { HasApiKeyAccessWithSubscriber } from '../guard/api/hasApiKeyAccessWithSubscriber';
import { ThrottlerForApiGuard } from '../guard/throttleForApiGuard';
import { List } from '../list/list.entity';
import { ExceptionResponse } from '../resposes/response';
import { SubscriberListApiService } from '../subscriber-list/subscriber-list.api.service';
import { SubscriberList } from '../subscriber-list/subscriber-list.entity';
import { PaginationQuery } from '../types/paginationQuery';
import { ApiVersion, apiPagination } from '../utils/constants';
import { AddSubscriberToListDto } from './dto/addSubscriberToList';
import { RemoveSubscriberFromListDto } from './dto/removeSubscriberFromList';
import { SubscriberIdParam } from './dto/subscriberIdParam';
import { UpdateEmailConcentDto } from './dto/updateEmailConcent';
import { UpdateSubscriberDto } from './dto/updateSubscriber';
import { UpdateSubscriberEmailStatusDto } from './dto/updateSubscriberEmailStatus';
import { SubscriberApiService } from './subscriber.api.service';
import { Subscriber } from './subscriber.entity';

@UseGuards(ApiKeyAuthGurad)
@UseGuards(ThrottlerForApiGuard)
@Throttle(150, 60)
@UseGuards(ApiPoliciesGuard)
@ApiTags('Subscriber')
@ApiHeader({
  name: 'revision',
  description: 'API endpoint revision (format: YYYY-MM-DD[.suffix])',
  required: true,
  schema: {
    default: ApiVersion.June23,
  },
})
@ApiResponse({ status: '4XX', type: ExceptionResponse })
@ApiResponse({ status: '5XX', type: ExceptionResponse })
@Controller('api/subscriber')
export class SubscriberApiController {
  constructor(
    private subscriberApiService: SubscriberApiService,
    private subscriberListApiService: SubscriberListApiService,
  ) {}

  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_READ, Subscriber),
  )
  @ApiOperation({
    summary: 'Get Subscriber',
    description:
      'Get subscriber with the given subscriber ID.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`subscriber:read`',
  })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @ApiOkResponse({ description: 'Get Subscriber', type: Subscriber })
  @Get(':subscriberId')
  getSubscriber(@Param() param: SubscriberIdParam): Promise<Subscriber> {
    return this.subscriberApiService.getSubscriber(param.subscriberId);
  }

  @Throttle(700, 60)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_READ, Subscriber),
  )
  @ApiOperation({
    summary: 'Get Subscribers',
    description:
      'Get Subscribers in an account.<br><br>*Rate limit*:<br>Limit: 700<br>TTL: 60s\n\n**Scopes:**\n`subscriber:read`',
  })
  @ApiOkResponse({ description: 'Get Subscribers', type: [Subscriber] })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    example: 100,
    description: `For more information please visit ${apiPagination}`,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    example: 0,
    description: `For more information please visit ${apiPagination}`,
    required: false,
  })
  @Get()
  getSubscribers(
    @ApiKey() apiKey: string,
    @Query() query: PaginationQuery,
  ): Promise<Subscriber[]> {
    return this.subscriberApiService.getSubscribers({
      apiKey,
      limit: query.limit,
      offset: query.page,
    });
  }

  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_READ, Subscriber),
  )
  @ApiOperation({
    summary: 'Get Subscribers Count',
    description:
      'Get total count of subscribers.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`subscriber:read`',
  })
  @ApiOkResponse({ description: 'Get Subscribers Count', type: Number })
  @Get('count')
  getSubscriberCount(@ApiKey() apiKey: string): Promise<number> {
    return this.subscriberApiService.getSubscriberCount(apiKey);
  }

  @Throttle(700, 60)
  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_MANAGE, Subscriber),
  )
  @ApiOperation({
    summary: 'Update Subscriber',
    description:
      'Update subscriber the given subscriber ID.<br><br>*Rate limit*:<br>Limit: 700<br>TTL: 60s\n\n**Scopes:**\n`subscriber:manage`',
  })
  @ApiOkResponse({ description: 'Update Subscriber', type: Subscriber })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @Patch(':subscriberId')
  updateSubscriber(
    @Param() param: SubscriberIdParam,
    @Body() body: UpdateSubscriberDto,
  ): Promise<Subscriber> {
    return this.subscriberApiService.updateSubscriber(param.subscriberId, body);
  }

  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_MANAGE, Subscriber),
  )
  @ApiOperation({
    summary: 'Update Email Status',
    description:
      'Update subscriber email status that affects how emails would be sent to all lists. Subscribers who marks email as spam or unsubscribes globally from all list. This is the second tier in the Subscriber Suppresion hit tier.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`subscriber:manage`',
  })
  @ApiOkResponse({
    description: 'Update Email Status',
    type: Subscriber,
  })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @Patch(':subscriberId/email-status')
  updateEmailStatus(
    @Param() param: SubscriberIdParam,
    @Body() body: UpdateSubscriberEmailStatusDto,
  ): Promise<Subscriber> {
    return this.subscriberApiService.updateSubscriberEmailStatus(
      param.subscriberId,
      body,
    );
  }

  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_READ, Subscriber),
  )
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.LIST_READ, List),
  )
  @ApiOperation({
    summary: 'Get Subscriber Lists',
    description:
      'Get all list membership for a subscriber with the given subscriber ID.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`subscriber:read`',
  })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies this subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @ApiOkResponse({ description: 'Get Subscriber Lists', type: SubscriberList })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    example: 100,
    description: `For more information please visit ${apiPagination}`,
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    example: 0,
    description: `For more information please visit ${apiPagination}`,
    required: false,
  })
  @Get(':subscriberId/list')
  getSubscriberLists(
    @Param() param: SubscriberIdParam,
    @Query() query: PaginationQuery,
  ): Promise<SubscriberList[]> {
    return this.subscriberListApiService.getSubscriberLists({
      id: param.subscriberId,
      take: query.limit,
      offset: query.page,
    });
  }

  @UseGuards(HasApiKeyAccessWithList)
  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_MANAGE, Subscriber),
  )
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.LIST_MANAGE, List),
  )
  @ApiOperation({
    summary: 'Add Subscriber To List',
    description:
      'Add a subscriber to a list with the given subscriber ID and list ID.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`list:manage`\n`subscriber:manage`',
  })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies the subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies the subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @ApiOkResponse({
    description: 'Add Subscriber To List',
    type: SubscriberList,
  })
  @Post(':subscriberId/list')
  addSubscriberToList(
    @Param() param: SubscriberIdParam,
    @Body() body: AddSubscriberToListDto,
  ): Promise<SubscriberList> {
    return this.subscriberApiService.addSubscriberToList(
      param.subscriberId,
      body,
    );
  }

  @UseGuards(HasApiKeyAccessWithList)
  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_MANAGE, Subscriber),
  )
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.LIST_MANAGE, List),
  )
  @ApiOperation({
    summary: 'Remove Subscriber From List',
    description:
      'Remove a subscriber from a list with the given subscriber ID and list ID.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`list:manage`\n`subscriber:manage`',
  })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies the subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies the subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @ApiOkResponse({
    description: 'Remove Subscriber From List',
    type: SubscriberList,
  })
  @Delete(':subscriberId/list')
  removeSubscriberFromList(
    @Param() param: SubscriberIdParam,
    @Body() body: RemoveSubscriberFromListDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.subscriberListApiService.removeSubscriberFromList(
      param.subscriberId,
      body,
      res,
    );
  }

  @UseGuards(HasApiKeyAccessWithList)
  @UseGuards(HasApiKeyAccessWithSubscriber)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.SUBSCRIBER_MANAGE, Subscriber),
  )
  @CheckPolicies((ability: AppAbility) =>
    ability.can(ApiKeyAccessScopeEnum.LIST_MANAGE, List),
  )
  @ApiOperation({
    summary: 'Update Email Concent',
    description:
      'Update email concent of a subscriber for a list. Subscribers `Subscribe` or `Unsbuscriber` to a list. This is the first tier of the Subscriber Suppresion hit tier.<br><br>*Rate limit*:<br>Limit: 150<br>TTL: 60s\n\n**Scopes:**\n`list:manage`\n`subscriber:manage`',
  })
  @ApiParam({
    name: 'subscriberId',
    description:
      'Primary key that uniquely identifies the subscriber. Generated by Bespoke.',
    required: true,
    schema: {
      description:
        'Primary key that uniquely identifies the subscriber. Generated by Bespoke.',
      type: 'string',
      example: 'UUID',
    },
  })
  @ApiOkResponse({
    description: 'Update Email Concent',
    type: SubscriberList,
  })
  @Patch(':subscriberId/list')
  updateEmailConcent(
    @Param() param: SubscriberIdParam,
    @Body() body: UpdateEmailConcentDto,
  ): Promise<SubscriberList> {
    return this.subscriberApiService.updateEmailConcent(
      param.subscriberId,
      body,
    );
  }
}
